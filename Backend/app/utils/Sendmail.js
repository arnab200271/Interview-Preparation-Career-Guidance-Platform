const sgMail = require("../config/email.config");
const ejs = require("ejs");
const path = require("path");

const sendmail = async (user, token) => {
  const backendUrl = process.env.BACKEND_URL;
  const link = `${backendUrl}/api/v1/auth/verify/${token}`;

  try {
    const html = await ejs.renderFile(
      path.join(__dirname, "../../views/email/verifyEmail.ejs"),
      {
        name: user.name,
        email: user.email,
        link,
        year: new Date().getFullYear(),
      },
    );

    const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM || "support.fullstackdev80@gmail.com",
      subject: "Verify Your Email Address | Career Platform",
      html,
    };

    // Fallback for local development when SendGrid API key is missing
    if (!process.env.SENDGRID_API_KEY) {
      console.log("\n==================================================");
      console.log("=== DEVELOPMENT EMAIL VERIFICATION LINK (NO API KEY) ===");
      console.log(`To: ${msg.to}`);
      console.log(`From: ${msg.from}`);
      console.log(`Subject: ${msg.subject}`);
      console.log(`Verification Link: ${link}`);
      console.log("==================================================\n");
      return {
        success: true,
        link,
      };
    }

    await sgMail.send(msg);
    console.log(`Verification email sent successfully via SendGrid to: ${user.email}`);

    return {
      success: true,
      link,
    };
  } catch (error) {
    console.error("Error sending verification email via SendGrid:", error);
    if (error.response && error.response.body) {
      console.error("SendGrid API Response Error Body:", JSON.stringify(error.response.body, null, 2));
    }
    throw new Error("Failed to send verification email");
  }
};

module.exports = sendmail;

