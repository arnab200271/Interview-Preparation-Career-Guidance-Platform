const mongoose = require("mongoose");
const schema = mongoose.Schema;
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
const resumeSchema = new schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  skills: [String],

  education: [educationSchema],

  experience: [experienceSchema],
  linkedin: {
    type: String,
  },

  projects: [projectSchema],
  languages: [String],
  template: {
    type: String,
    default: "modern",
  },
  themeColor: {
    type: String,
    default: "#2563eb",
  },
  certifications: [
    {
      title: String,
      issuer: String,
      issueDate: String,
      certificateLink: String,
    },
  ],
  resumeImage: {
    type: String,
  },
  resumeImagepublic_Id: {
    type: String,
  },
});
const resumeModel = mongoose.model("resume",resumeSchema)
module.exports = resumeModel