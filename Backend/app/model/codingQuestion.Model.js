const mongoose = require("mongoose");
const schema = mongoose.Schema;

// Schema for examples shown in the problem description
const exampleSchema = new schema(
  {
    input: {
      type: String,
      required: [true, "Example input is required"],
      trim: true,
    },
    output: {
      type: String,
      required: [true, "Example output is required"],
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

// Schema for starter code templates for different languages
const starterCodeSchema = new schema(
  {
    language: {
      type: String,
      required: [true, "Starter code language is required"],
      enum: {
        values: ["javascript", "react", "nodejs"],
        message: "Language must be javascript, react, or nodejs",
      },
    },
    code: {
      type: String,
      required: [true, "Starter code content is required"],
    },
  },
  { _id: false }
);

// Schema for test cases used for verification
const testCaseSchema = new schema({
  input: {
    type: String,
    required: [true, "Test case input is required"],
  },
  expectedOutput: {
    type: String,
    required: [true, "Test case expected output is required"],
  },
  isSample: {
    type: Boolean,
    default: false, // if true, this testcase is public and can be run by candidate
  },
  isHidden: {
    type: Boolean,
    default: true, // if true, the input/output are hidden from candidates (evaluation tests)
  },
});

const codingQuestionSchema = new schema(
  {
    title: {
      type: String,
      required: [true, "Question title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: [true, "Question slug is required"],
      unique: true,
      trim: true,
      index: true,
      lowercase: true,
    },
    problemStatement: {
      type: String,
      required: [true, "Problem statement is required"],
      trim: true,
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
    },
    codingTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodingTest",
      required: [true, "Coding test reference is required"],
    },
    marks: {
      type: Number,
      required: [true, "Marks are required"],
      min: [0, "Marks cannot be negative"],
      default: 0,
    },
    constraints: {
      type: [String],
      default: [],
    },
    examples: {
      type: [exampleSchema],
      default: [],
    },
    starterCode: {
      type: [starterCodeSchema],
      required: [true, "Starter code is required"],
    },
    boilerplateCode: {
      type: String, // optional code that surrounds user submission for automated runner execution
      trim: true,
      default: "",
    },
    functionName: {
      type: String, // name of entry function to invoke (e.g. 'twoSum')
      trim: true,
      default: "",
    },
    supportedLanguages: {
      type: [String],
      default: ["javascript"],
      enum: {
        values: ["javascript", "react", "nodejs"],
        message: "Supported languages are javascript, react, or nodejs",
      },
    },
    testCases: {
      type: [testCaseSchema],
      required: [true, "At least one test case is required"],
    },
    // Sandbox limits
    timeLimit: {
      type: Number, // execution time limit in milliseconds
      default: 2000,
      min: [100, "Time limit must be at least 100ms"],
    },
    memoryLimit: {
      type: Number, // memory limit in MB
      default: 512,
      min: [16, "Memory limit must be at least 16MB"],
    },
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

const CodingQuestion = mongoose.model("CodingQuestion", codingQuestionSchema);
module.exports = CodingQuestion;
