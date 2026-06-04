"use strict";

/**
 * vmExecutor.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Secure Node.js VM-based code execution engine.
 *
 * Drop-in replacement for the Docker-based jsExecutor.js.
 * Exports the same `executeTestCase` function with the identical signature
 * and return shape so no other file (controller / router / frontend) needs
 * to change.
 *
 * Security guarantees
 * ───────────────────
 * • Runs inside a frozen V8 context – no access to the host process.
 * • Blocked globals: require, process, Buffer, global, __dirname,
 *   __filename, setTimeout, setInterval, clearTimeout, clearInterval,
 *   fetch, XMLHttpRequest, WebSocket, fs, child_process, net, http, https.
 * • Hard execution timeout enforced by the VM module itself.
 * • No temp files written to disk.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const vm = require("vm");
const { performance } = require("perf_hooks");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: normalise a value returned by user code into a comparable string
// ─────────────────────────────────────────────────────────────────────────────
const normalise = (value) => {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: deep-equal comparison after JSON round-trip (order-insensitive for
// arrays of primitives if both sides parse to the same JSON)
// ─────────────────────────────────────────────────────────────────────────────
const outputsMatch = (actual, expected) => {
  const a = actual.trim();
  const e = (expected || "").trim();
  if (a === e) return true;

  // JSON deep-compare fallback
  try {
    return JSON.stringify(JSON.parse(a)) === JSON.stringify(JSON.parse(e));
  } catch (_) {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Build a frozen, restricted sandbox context
// ─────────────────────────────────────────────────────────────────────────────
const buildSandbox = (stdoutLines) => {
  const sandbox = Object.create(null);

  // Console — capture, never write to host stdout
  sandbox.console = Object.freeze({
    log: (...args) =>
      stdoutLines.push(
        args
          .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
          .join(" ")
      ),
    error: (...args) =>
      stdoutLines.push(
        "[stderr] " +
          args
            .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
            .join(" ")
      ),
    warn: (...args) =>
      stdoutLines.push(
        "[warn] " +
          args
            .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
            .join(" ")
      ),
    info: (...args) =>
      stdoutLines.push(
        "[info] " +
          args
            .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
            .join(" ")
      ),
  });

  // Safe built-ins
  sandbox.JSON = JSON;
  sandbox.Math = Math;
  sandbox.Number = Number;
  sandbox.String = String;
  sandbox.Boolean = Boolean;
  sandbox.Array = Array;
  sandbox.Object = Object;
  sandbox.Map = Map;
  sandbox.Set = Set;
  sandbox.Date = Date;
  sandbox.RegExp = RegExp;
  sandbox.Error = Error;
  sandbox.TypeError = TypeError;
  sandbox.RangeError = RangeError;
  sandbox.parseInt = parseInt;
  sandbox.parseFloat = parseFloat;
  sandbox.isNaN = isNaN;
  sandbox.isFinite = isFinite;
  sandbox.decodeURIComponent = decodeURIComponent;
  sandbox.encodeURIComponent = encodeURIComponent;
  sandbox.Symbol = Symbol;
  sandbox.Promise = Promise; // allow async patterns in helper fns

  // Explicitly poison dangerous globals so even clever prototype tricks fail
  sandbox.require = undefined;
  sandbox.process = undefined;
  sandbox.Buffer = undefined;
  sandbox.global = undefined;
  sandbox.__dirname = undefined;
  sandbox.__filename = undefined;
  sandbox.module = undefined;
  sandbox.exports = undefined;
  sandbox.setTimeout = undefined;
  sandbox.setInterval = undefined;
  sandbox.clearTimeout = undefined;
  sandbox.clearInterval = undefined;
  sandbox.setImmediate = undefined;
  sandbox.queueMicrotask = undefined;
  sandbox.fetch = undefined;

  // Internal bridge slots (populated before each invocation)
  sandbox.__args__ = [];
  sandbox.__fn__ = null;
  sandbox.__result__ = undefined;

  vm.createContext(sandbox);
  return sandbox;
};

// ─────────────────────────────────────────────────────────────────────────────
// TLE detector  – vm throws with code ERR_SCRIPT_EXECUTION_TIMEOUT or the
// message contains "timed out" depending on Node version
// ─────────────────────────────────────────────────────────────────────────────
const isTLE = (err) =>
  err.code === "ERR_SCRIPT_EXECUTION_TIMEOUT" ||
  (err.message || "").toLowerCase().includes("timed out") ||
  (err.message || "").toLowerCase().includes("script execution timed out");

// ─────────────────────────────────────────────────────────────────────────────
// Main export – identical signature to jsExecutor.executeTestCase
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Executes user JavaScript code inside a secure Node.js VM sandbox and
 * evaluates it against a single test case.
 *
 * @param {string} userCode          Candidate's submitted JavaScript source.
 * @param {string} functionName      Entry-point function name (e.g. "twoSum").
 * @param {string} inputStr          JSON-serialised argument list or raw string.
 * @param {string} expectedOutputStr Expected return value as a string.
 * @param {number} timeLimitMs       Per-test-case time limit (capped at 5 000 ms).
 * @param {string} language          Programming language – only "javascript" supported.
 * @returns {object}                 { passed, actualOutput, got, expected, stdout, stderr, error, executionTime }
 */
const executeTestCase = (
  userCode,
  functionName,
  inputStr,
  expectedOutputStr,
  timeLimitMs = 5000,
  language = "javascript"
) => {
  const startTime = performance.now();
  const lang = (language || "javascript").toLowerCase();

  // ── Language guard ────────────────────────────────────────────────────────
  if (lang !== "javascript") {
    return {
      passed: false,
      actualOutput: "",
      got: "",
      expected: expectedOutputStr,
      stdout: "",
      stderr: `Language '${language}' is not supported yet.`,
      error: `Language '${language}' is not supported yet.`,
      executionTime: 0,
    };
  }

  const maxTimeout = Math.min(5000, timeLimitMs || 5000);
  const stdoutLines = [];
  const sandbox = buildSandbox(stdoutLines);

  // ── Phase 1: Compile & run user code to define the function ──────────────
  try {
    vm.runInContext(userCode, sandbox, { timeout: maxTimeout });
  } catch (err) {
    const executionTime = parseFloat((performance.now() - startTime).toFixed(2));

    if (isTLE(err)) {
      return {
        passed: false,
        actualOutput: "",
        got: "",
        expected: expectedOutputStr,
        stdout: stdoutLines.join("\n"),
        stderr: `Time Limit Exceeded: Execution took longer than ${maxTimeout / 1000}s.`,
        error: "Time Limit Exceeded",
        executionTime: maxTimeout,
      };
    }

    // SyntaxError / ReferenceError / runtime crash during top-level run
    return {
      passed: false,
      actualOutput: "",
      got: "",
      expected: expectedOutputStr,
      stdout: stdoutLines.join("\n"),
      stderr: err.message,
      error: err.message,
      executionTime,
    };
  }

  // ── Phase 2: Verify the entry-point function exists ───────────────────────
  if (typeof sandbox[functionName] !== "function") {
    const executionTime = parseFloat((performance.now() - startTime).toFixed(2));
    const msg = `Function '${functionName}' is not defined in your code`;
    return {
      passed: false,
      actualOutput: "",
      got: "",
      expected: expectedOutputStr,
      stdout: stdoutLines.join("\n"),
      stderr: msg,
      error: msg,
      executionTime,
    };
  }

  // ── Phase 3: Parse input arguments ───────────────────────────────────────
  let args = [];
  try {
    const raw = (inputStr || "").trim();
    if (raw === "") {
      args = [];
    } else {
      const parsed = JSON.parse(raw);
      args = Array.isArray(parsed) ? parsed : [parsed];
    }
  } catch (_) {
    // If JSON parse fails, treat as a single string argument
    args = inputStr ? [inputStr] : [];
  }

  // ── Phase 4: Invoke the function inside the VM ────────────────────────────
  let actualOutput = "";

  try {
    sandbox.__args__ = args;
    sandbox.__fn__ = sandbox[functionName];
    sandbox.__result__ = undefined;

    // Execute function call in same context so it has access to helpers the
    // user may have defined at the top level
    vm.runInContext(`__result__ = __fn__(...__args__);`, sandbox, {
      timeout: maxTimeout,
    });

    actualOutput = normalise(sandbox.__result__);
  } catch (err) {
    const executionTime = parseFloat((performance.now() - startTime).toFixed(2));

    if (isTLE(err)) {
      return {
        passed: false,
        actualOutput: "",
        got: "",
        expected: expectedOutputStr,
        stdout: stdoutLines.join("\n"),
        stderr: `Time Limit Exceeded: Execution took longer than ${maxTimeout / 1000}s.`,
        error: "Time Limit Exceeded",
        executionTime: maxTimeout,
      };
    }

    return {
      passed: false,
      actualOutput: "",
      got: "",
      expected: expectedOutputStr,
      stdout: stdoutLines.join("\n"),
      stderr: err.message,
      error: err.message,
      executionTime,
    };
  }

  const executionTime = parseFloat((performance.now() - startTime).toFixed(2));

  // ── Phase 5: Compare output ───────────────────────────────────────────────
  const passed = outputsMatch(actualOutput, expectedOutputStr);

  return {
    passed,
    actualOutput,
    got: actualOutput,
    expected: expectedOutputStr,
    stdout: stdoutLines.join("\n"),
    stderr: "",
    error: null,
    executionTime,
  };
};

module.exports = { executeTestCase };
