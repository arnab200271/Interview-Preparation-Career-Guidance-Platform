const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");

class RunCodeController {
  async runCode(req, res) {
    try {
      const { code } = req.body;
      //console.log("RUN CODE API HIT");
      if (!code) {
        return res.status(400).json({
          success: false,
          message: "Code is required",
        });
      }

      const fileName = `${uuidv4()}.js`;
      const filePath = path.join(process.cwd(), "temp", fileName);

      if (!fs.existsSync("temp")) {
        fs.mkdirSync("temp");
      }

      fs.writeFileSync(filePath, code);

      const dockerCommand = `docker run --rm -v "${filePath}:/app/code.js" coding-sandbox`;

      exec(dockerCommand, { timeout: 5000 }, (error, stdout, stderr) => {
        fs.unlinkSync(filePath);

        if (error) {
          return res.status(500).json({
            success: false,
            output: stderr || error.message,
          });
        }

        return res.status(200).json({
          success: true,
          output: stdout,
        });
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new RunCodeController();