const dotenv = require("dotenv");
dotenv.config();
const sgMail = require("@sendgrid/mail");

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("Warning: SENDGRID_API_KEY is not set in environment variables. Email sending will be bypassed/logged in development mode.");
}

module.exports = sgMail;

