const sgMail = require("../config/email.config");
const ejs = require("ejs");
const path = require("path");

const sendResetPasswordMail = async (user, token) => {
  const frontendUrl = process.env.FRONTEND_URL ;
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  try {
    const html = await ejs.renderFile(
      path.join(
        __dirname,
        "../../views/resetpasswordmail/resetPassword.ejs"
      ),
      {
        name: user.name,
        resetLink,
        year: new Date().getFullYear(),
      }
    );

    const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM || "support.fullstackdev80@gmail.com",
      subject: "Reset Your Password | Career Platform",
      html,
    };

    // Fallback for local development when SendGrid API key is missing
    if (!process.env.SENDGRID_API_KEY) {
      console.log("\n==================================================");
      console.log("=== DEVELOPMENT PASSWORD RESET LINK (NO API KEY) ===");
      console.log(`To: ${msg.to}`);
      console.log(`From: ${msg.from}`);
      console.log(`Subject: ${msg.subject}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log("==================================================\n");
      return;
    }

    await sgMail.send(msg);
    console.log(`Reset password email sent successfully via SendGrid to: ${user.email}`);
  } catch (error) {
    console.error("Error sending reset password email via SendGrid:", error);
    if (error.response && error.response.body) {
      console.error("SendGrid API Response Error Body:", JSON.stringify(error.response.body, null, 2));
    }
    throw new Error("Failed to send reset password email");
  }
};

module.exports = sendResetPasswordMail;
