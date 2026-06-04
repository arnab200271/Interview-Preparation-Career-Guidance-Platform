const mongoose = require("mongoose");
const crypto = require("crypto");

const educationSchema = new mongoose.Schema({
  institute: String,
  degree: String,
  fieldOfStudy: String,
  startYear: String,
  endYear: String,
  grade: String,
});

const experienceSchema = new mongoose.Schema({
  company: String,
  position: String,
  startDate: String,
  endDate: String,
  currentlyWorking: Boolean,
  description: String,
});

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  githubLink: String,
  liveLink: String,
  technologies: [String],
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: String,

    resetPasswordExpire: Date,
    role: {
      type: String,
      enum: ["candidate", "admin"],
      default: "candidate",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
    },
    public_Id: {
      type: String,
    },
    verificationToken: String,

    bio: String,

    phone: String,

    location: String,

    github: String,

    linkedin: String,

    portfolio: String,

    skills: [String],

    education: [educationSchema],

    experience: [experienceSchema],

    projects: [projectSchema],

    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
