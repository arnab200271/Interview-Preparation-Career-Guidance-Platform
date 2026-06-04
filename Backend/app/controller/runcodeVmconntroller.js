"use strict";

/**
 * runcodeVmconntroller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles the simple "Run Code" scratch-pad endpoint (/run-code-vm).
 * Executes arbitrary JavaScript in a secure VM sandbox and returns
 * stdout / result output to the client.  No DB write, no test-case evaluation.
 *
 * This controller is intentionally kept separate from the submission flow
 * so it can be used by the code editor's "Run" button without needing a
 * questionId or testId.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const vm = require("vm");
const { performance } = require("perf_hooks");

// ─── Timeout cap ─────────────────────────────────────────────────────────────
const MAX_TIMEOUT_MS = 5000;

// ─── Build a restricted sandbox ──────────────────────────────────────────────
const buildSandbox = (stdoutLines) => {
  const sandbox = Object.create(null);

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

  // Safe standard globals
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
  sandbox.Symbol = Symbol;
  sandbox.Promise = Promise;
  sandbox.decodeURIComponent = decodeURIComponent;
  sandbox.encodeURIComponent = encodeURIComponent;

  // Block dangerous globals
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
  sandbox.fetch = undefined;

  vm.createContext(sandbox);
  return sandbox;
};

// ─── TLE detector ────────────────────────────────────────────────────────────
const isTLE = (err) =>
  err.code === "ERR_SCRIPT_EXECUTION_TIMEOUT" ||
  (err.message || "").toLowerCase().includes("timed out") ||
  (err.message || "").toLowerCase().includes("script execution timed out");

class RunCodeVmController {
  /**
   * POST /run-code-vm
   * Body: { code: string, timeout?: number }
   * Returns: { success, output, executionTime }
   */
  async runCode(req, res) {
    const startTime = performance.now();

    try {
      const { code, timeout } = req.body;

      if (!code || typeof code !== "string" || code.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "code is required and must be a non-empty string",
        });
      }

      const timeoutMs = Math.min(
        MAX_TIMEOUT_MS,
        Number(timeout) || MAX_TIMEOUT_MS
      );

      const stdoutLines = [];
      const sandbox = buildSandbox(stdoutLines);

      let lastValue;
      try {
        lastValue = vm.runInContext(code, sandbox, { timeout: timeoutMs });
      } catch (err) {
        const executionTime = parseFloat(
          (performance.now() - startTime).toFixed(2)
        );

        if (isTLE(err)) {
          return res.status(200).json({
            success: false,
            output: `Time Limit Exceeded: Execution took longer than ${timeoutMs / 1000}s.`,
            executionTime: timeoutMs,
          });
        }

        // Runtime / Syntax error — return as output, not 500
        return res.status(200).json({
          success: false,
          output: err.message,
          executionTime,
        });
      }

      const executionTime = parseFloat(
        (performance.now() - startTime).toFixed(2)
      );

      // If user printed something via console.log, show that.
      // If the last expression returned a non-undefined value and nothing was
      // printed, echo the return value so REPL-style usage works.
      let outputLines = [...stdoutLines];
      if (
        outputLines.length === 0 &&
        lastValue !== undefined &&
        lastValue !== null
      ) {
        outputLines.push(
          typeof lastValue === "object"
            ? JSON.stringify(lastValue)
            : String(lastValue)
        );
      }

      return res.status(200).json({
        success: true,
        output: outputLines.join("\n"),
        executionTime,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error during code execution",
        output: error.message,
      });
    }
  }
}

module.exports = new RunCodeVmController();