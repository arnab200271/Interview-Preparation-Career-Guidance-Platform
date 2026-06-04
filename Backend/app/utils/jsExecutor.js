const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const { performance } = require("perf_hooks");

/**
 * Safely executes JavaScript code inside a Docker sandbox against a specific test case.
 *
 * @param {string} userCode The candidate's submitted JavaScript code.
 * @param {string} functionName The entry function name to invoke (e.g. 'twoSum').
 * @param {string} inputStr The serialized input parameters or raw stdin.
 * @param {string} expectedOutputStr The expected output to compare against.
 * @param {number} timeLimitMs The execution time limit in milliseconds.
 * @param {string} language The programming language of the code.
 * @returns {Promise<object>} The evaluation outcome containing status, output, logs, errors, and duration.
 */
const executeTestCase = async (
  userCode,
  functionName,
  inputStr,
  expectedOutputStr,
  timeLimitMs = 5000,
  language = "javascript",
) => {
  const startTime = performance.now();

  let wrappedCode = "";
  let fileExt = ".js";
  let dockerCommand = "";

  // Normalize language name
  const lang = (language || "javascript").toLowerCase();

  if (lang === "javascript") {
    fileExt = ".js";
    wrappedCode = `
${userCode}

(function() {
  let args = [];

  try {
    const inputStr = ${JSON.stringify(inputStr || "")};
    const parsed = JSON.parse(inputStr.trim());

    // Generic argument parser
    if (Array.isArray(parsed)) {
      args = parsed;
    } else {
      args = [parsed];
    }
  } catch (e) {
    args = [${JSON.stringify(inputStr || "")}];
  }

  try {
    if (typeof ${functionName.trim()} !== "function") {
      throw new Error("Function '${functionName.trim()}' is not defined in your code");
    }

    const result = ${functionName.trim()}(...args);

    console.log(
      "\\n##RESULT##" +
        JSON.stringify({
          success: true,
          result,
        })
    );
  } catch (err) {
    console.log(
      "\\n##RESULT##" +
        JSON.stringify({
          success: false,
          error: err.message || String(err),
          stack: err.stack,
        })
    );
  }
})();
`;
  } else {
    // Return early if language is not supported
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

  const fileName = `${uuidv4()}${fileExt}`;
  const tempDir = path.join(__dirname, "..", "..", "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const filePath = path.join(tempDir, fileName);

  try {
    fs.writeFileSync(filePath, wrappedCode, "utf8");
  } catch (err) {
    console.error("Failed to write temporary execution file:", err);
    return {
      passed: false,
      actualOutput: "",
      got: "",
      expected: expectedOutputStr,
      stdout: "",
      stderr: "Internal server error: Failed to create temp file",
      error: err.message,
      executionTime: 0,
    };
  }

  if (lang === "javascript") {
    // Docker run with resource limit controls: no network, CPU, Memory limits
    dockerCommand = `docker run --rm --network none --memory 128m --cpus 0.5 -v "${filePath}:/app/code.js" coding-sandbox`;
  }

  // Set user code execution limit (5 seconds max as requested)
  const maxUserTimeLimit = Math.min(5000, timeLimitMs);
  // Add 5-second buffer for Docker container initialization on the host OS
  const processTimeoutMs = maxUserTimeLimit + 5000;

  return new Promise((resolve) => {
    exec(
      dockerCommand,
      { timeout: processTimeoutMs },
      (error, stdout, stderr) => {
        // Clean up file immediately
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error("Failed to delete temp file:", err);
        }

        const endTime = performance.now();
        // Estimate user execution time by subtracting Docker overhead if not timed out, capped at maxUserTimeLimit
        const totalProcessTime = endTime - startTime;
        const dockerOverheadEst = 3500; // estimated docker spin-up overhead
        const executionTime = error
          ? maxUserTimeLimit
          : parseFloat(
              Math.min(
                maxUserTimeLimit,
                Math.max(1, totalProcessTime - dockerOverheadEst),
              ).toFixed(2),
            );

        // Handle Timeout / Process Termination
        if (
          error &&
          (error.killed ||
            error.signal === "SIGTERM" ||
            error.signal === "SIGKILL" ||
            error.message.includes("ETIMEDOUT"))
        ) {
          return resolve({
            passed: false,
            actualOutput: "",
            got: "",
            expected: expectedOutputStr,
            stdout: "",
            stderr: `Time Limit Exceeded: Execution took longer than ${maxUserTimeLimit / 1000} seconds.`,
            error: "Time Limit Exceeded",
            executionTime: maxUserTimeLimit,
          });
        }

        // Analyze output of the container
        let userStdout = "";
        let userStderr = stderr || "";
        let actualOutput = "";
        let hasFailed = false;
        let errorMsg = "";

        if (error && !userStderr) {
          userStderr = error.message;
        }

        // Parse stdout
        const stdoutStr = stdout || "";

        // The runner.js wraps user output between "===== USER CODE OUTPUT =====" and "===== EXECUTION FINISHED ====="
        const startMarker = "===== USER CODE OUTPUT =====";
        const endMarker = "===== EXECUTION FINISHED =====";

        const startIndex = stdoutStr.indexOf(startMarker);
        const endIndex = stdoutStr.indexOf(endMarker);

        if (startIndex !== -1) {
          let content = "";
          if (endIndex !== -1) {
            content = stdoutStr.substring(
              startIndex + startMarker.length,
              endIndex,
            );
          } else {
            content = stdoutStr.substring(startIndex + startMarker.length);
          }

          // Search for ##RESULT## block
          const resultMarker = "##RESULT##";
          const resultIndex = content.indexOf(resultMarker);

          if (resultIndex !== -1) {
            userStdout = content.substring(0, resultIndex).trim();
            const resultJsonStr = content
              .substring(resultIndex + resultMarker.length)
              .trim();

            try {
              const outcome = JSON.parse(resultJsonStr);
              if (outcome.success) {
                const res = outcome.result;
                if (res === undefined) {
                  actualOutput = "undefined";
                } else if (res === null) {
                  actualOutput = "null";
                } else if (typeof res === "object") {
                  actualOutput = JSON.stringify(res);
                } else {
                  actualOutput = String(res);
                }
              } else {
                hasFailed = true;
                errorMsg = outcome.error || "Runtime Error";
                userStderr = outcome.stack || outcome.error || "";
              }
            } catch (e) {
              hasFailed = true;
              errorMsg = "Failed to parse sandbox execution result";
              userStderr = e.message;
            }
          } else {
            // No result marker found - code probably exited abnormally or had syntax error
            userStdout = content.trim();
            const errorHeader = "Execution Error:";
            const errorHeaderIndex = userStdout.indexOf(errorHeader);
            if (errorHeaderIndex !== -1) {
              hasFailed = true;
              errorMsg = userStdout
                .substring(errorHeaderIndex + errorHeader.length)
                .trim();
              userStderr = errorMsg;
              userStdout = userStdout.substring(0, errorHeaderIndex).trim();
            } else if (stderr) {
              hasFailed = true;
              errorMsg = stderr.trim();
              userStderr = stderr.trim();
            } else {
              hasFailed = true;
              errorMsg = "Execution failed without producing a result.";
            }
          }
        } else {
          // Output format unrecognized
          hasFailed = true;
          errorMsg =
            "Sandbox environment failed to initialize or execute the script.";
          if (stdoutStr) {
            userStderr = stdoutStr;
          }
        }

        // Check if actual output matches expected output
        let passed = false;
        if (!hasFailed) {
          const cleanActual = actualOutput.trim();
          const cleanExpected = (expectedOutputStr || "").trim();

          if (cleanActual === cleanExpected) {
            passed = true;
          } else {
            // JSON deep comparison fallback
            try {
              const parsedActual = JSON.parse(cleanActual);
              const parsedExpected = JSON.parse(cleanExpected);
              passed =
                JSON.stringify(parsedActual) === JSON.stringify(parsedExpected);
            } catch (e) {
              passed = false;
            }
          }
        }

        return resolve({
          passed,
          actualOutput: hasFailed ? "" : actualOutput,
          got: hasFailed ? "" : actualOutput,
          expected: expectedOutputStr,
          stdout: userStdout,
          stderr: userStderr,
          error: hasFailed ? errorMsg : null,
          executionTime,
        });
      },
    );
  });
};

module.exports = {
  executeTestCase,
};
