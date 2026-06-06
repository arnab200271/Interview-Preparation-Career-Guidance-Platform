const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const generateResumePDF = async (htmlContent) => {
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    // New page
    const page = await browser.newPage();

    // Better rendering quality
    await page.setViewport({
      width: 1440,
      height: 2000,
      deviceScaleFactor: 2,
    });

    // Set HTML content
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    // VERY IMPORTANT
    // Makes PDF render exactly like browser screen preview
    await page.emulateMediaType("screen");

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",

      // Keep colors/backgrounds
      printBackground: true,

      // Better CSS page sizing
      preferCSSPageSize: true,

      // Remove default browser margins
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },

      // Better rendering quality
      scale: 1,
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.log("PDF Generate Error:", error);
    throw error;
  }
};

module.exports = generateResumePDF;
