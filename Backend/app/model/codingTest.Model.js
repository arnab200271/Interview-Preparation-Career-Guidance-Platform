const mongoose = require("mongoose");
const schema = mongoose.Schema;

const codingTestSchema = new schema(
  {
    title: {
      type: String,
      required: [true, "Coding test title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: [true, "Coding test slug is required"],
      unique: true,
      trim: true,
      index: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration (in minutes) is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: [0, "Total marks cannot be negative"],
      default: 0,
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty is required"],
      enum: {
        values: ["easy", "medium", "hard"],
        message: "Difficulty must be easy, medium, or hard",
      },
      default: "easy",
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    codingQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CodingQuestion",
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

const CodingTest = mongoose.model("CodingTest", codingTestSchema);
module.exports = CodingTest;
