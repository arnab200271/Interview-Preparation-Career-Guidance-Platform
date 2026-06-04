const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    // User who attempted the test
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which test was attempted
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },

    // Submitted answers
    answers: [
      {
        // Question reference
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },

        // User selected answer
        selectedAnswer: {
          type: String,
          required: true,
        },

        // Was answer correct?
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Final score
    score: {
      type: Number,
      default: 0,
    },

    // Total correct answers
    correctAnswers: {
      type: Number,
      default: 0,
    },

    // Total wrong answers
    wrongAnswers: {
      type: Number,
      default: 0,
    },

    // Total skipped questions
    skippedQuestions: {
      type: Number,
      default: 0,
    },

    // Total questions in test
    totalQuestions: {
      type: Number,
      required: true,
    },

    // Time taken in minutes
    timeTaken: {
      type: Number,
      default: 0,
    },

    // Percentage
    percentage: {
      type: Number,
      default: 0,
    },

    // Pass / Fail
    status: {
      type: String,
      enum: ["pass", "fail"],
      default: "fail",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);