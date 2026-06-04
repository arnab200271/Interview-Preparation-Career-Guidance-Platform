const vm = require("vm");

const runCode = async (code) => {
  try {
    const logs = [];

    const sandbox = {
      console: {
        log: (...args) => {
          logs.push(args.join(" "));
        },
      },
    };

    vm.createContext(sandbox);

    vm.runInContext(code, sandbox, {
      timeout: 1000,
    });

    return {
      success: true,
      output: logs.join("\n"),
    };
  } catch (error) {
    return {
      success: false,
      output: error.message,
    };
  }
};

module.exports = runCode;