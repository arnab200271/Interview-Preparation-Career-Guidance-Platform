const fs = require("fs");
const path = require("path");

const getTemplate = (templateName) => {

   const filePath =
   path.join(
      process.cwd(),
      "templates",
      `${templateName}.html`
   );

   return fs.readFileSync(filePath, "utf-8");
};

module.exports = getTemplate;