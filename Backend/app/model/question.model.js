const mongoose = require("mongoose");
const schema = mongoose.Schema;
const questionSchema = new schema(
  {
    // Which test this question belongs to
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },

    // Question title
    question: {
      type: String,
      required: true,
      trim: true,
    },

    // MCQ options

    options: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length >= 2;
        },
        message: "At least 2 options are required",
      },
    },

    // Correct answer
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (value) {
          return this.options.includes(value);
        },
        message: "Correct answer must match one of the options",
      },
    },

    // Optional explanation
    explanation: {
      type: String,
      default: "",
    },

    // Marks per question
    marks: {
      type: Number,
      default: 1,
    },

    // Per question timer (seconds)
    questionTime: {
      type: Number,
      default: 10,
    },

    // Active/inactive question
    isActive: {
      type: Boolean,
      default: true,
    },

    // Admin who created question
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);
const questionmodel = mongoose.model("Question", questionSchema);
module.exports = questionmodel;
