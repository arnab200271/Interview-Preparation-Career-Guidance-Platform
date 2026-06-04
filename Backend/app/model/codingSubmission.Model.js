const mongoose = require("mongoose");
const schema = mongoose.Schema;

// Granular testcase run outcomes for Judge0/Docker integration
const testCaseResultSchema = new schema(
  {
    testCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      description: "Reference to the specific test case verified",
    },
    passed: {
      type: Boolean,
      required: [true, "Status of test case execution is required"],
    },
    stdout: {
      type: String,
      default: "",
    },
    stderr: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    executionTime: {
      type: Number, // in milliseconds
      default: 0,
    },
  },
  { _id: false }
);

const codingSubmissionSchema = new schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    codingTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodingTest",
      required: [true, "Coding test reference is required"],
      index: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodingQuestion",
      required: [true, "Coding question reference is required"],
    },
    submittedCode: {
      type: String,
      required: [true, "Submitted code is required"],
    },
    language: {
      type: String,
      required: [true, "Programming language is required"],
      enum: {
        values: ["javascript", "react", "nodejs"],
        message: "Supported languages are javascript, react, or nodejs",
      },
    },
    passedTestCases: {
      type: Number,
      required: [true, "Number of passed test cases is required"],
      min: [0, "Passed test cases cannot be negative"],
      default: 0,
    },
    totalTestCases: {
      type: Number,
      required: [true, "Total test cases count is required"],
      min: [0, "Total test cases cannot be negative"],
      default: 0,
    },
    score: {
      type: Number,
      required: [true, "Earned score is required"],
      min: [0, "Score cannot be negative"],
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks for the question is required"],
      min: [0, "Total marks cannot be negative"],
      default: 0,
    },
    percentage: {
      type: Number,
      required: [true, "Score percentage is required"],
      min: [0, "Percentage cannot be less than 0"],
      max: [100, "Percentage cannot be greater than 100"],
      default: 0,
    },
    executionTime: {
      type: Number, // execution time in ms (max across testcases or average)
      default: 0,
    },
    status: {
      type: String,
      required: [true, "Submission evaluation status is required"],
      enum: {
        values: ["pending", "processing", "completed", "failed"],
        message: "Status must be pending, processing, completed, or failed",
      },
      default: "pending",
    },
    finalResult: {
      type: String,
      required: [true, "Final execution verdict is required"],
      enum: {
        values: [
          "accepted",
          "partially_accepted",
          "wrong_answer",
          "compile_error",
          "runtime_error",
          "time_limit_exceeded",
          "memory_limit_exceeded",
          "none",
        ],
        message: "Invalid finalResult value",
      },
      default: "none",
    },
    submittedAt: {
      type: Date,
      required: [true, "Submission date is required"],
      default: Date.now,
    },
    // Granular test run reports
    testCaseResults: {
      type: [testCaseResultSchema],
      default: [],
    },
    // Judge0 integration parameters
    judge0Token: {
      type: String,
      index: true,
      sparse: true, // index allows null/missing values
      description: "Judge0 submission token used for polling or callback matching",
    },
    judge0StatusId: {
      type: Number,
      description: "Status identifier returned by Judge0 system (e.g. 3 for Accepted)",
    },
  },
  {
    timestamps: true,
  }
);

const CodingSubmission = mongoose.model("CodingSubmission", codingSubmissionSchema);
module.exports = CodingSubmission;
