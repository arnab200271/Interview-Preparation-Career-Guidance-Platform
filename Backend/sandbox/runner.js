const fs = require("fs");

try {
console.log("RUN CODE HIT");
console.log("REQ BODY:", req.body);
console.log("FILE PATH:", filePath);
  const code = fs.readFileSync("/app/code.js", "utf8");

  console.log("===== USER CODE OUTPUT =====");

  eval(code);

  console.log("===== EXECUTION FINISHED =====");
} catch (error) {
  console.error("Execution Error:");
  console.error(error.message);
}