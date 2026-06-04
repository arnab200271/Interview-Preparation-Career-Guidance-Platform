const QuestionModel = require("../model/question.model");
const Testmodel = require("../model/test.Model");
const Notification = require("../model/notification.Model");
const { getIO } = require("../../SoketIo/socket");
class questionController {
  // ===============================
  // CREATE QUESTION
  // ===============================
  async createQuestion(req, res) {
    try {
      // GET USER
      const user = req.user;

      //  AUTH CHECK
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized user",
        });
      }

      //  ROLE CHECK
      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only admin can create question",
        });
      }

      //  GET DATA
      const {
        testId,
        question,
        options,
        correctAnswer,
        explanation,
        marks,
        questionTime,
      } = req.body;

      //VALIDATION
      if (!testId || !question || !options || !correctAnswer) {
        return res.status(400).json({
          success: false,
          message: "Required fields are missing",
        });
      }

      //  TEST EXISTS CHECK
      const test = await Testmodel.findById(testId);

      if (!test) {
        return res.status(404).json({
          success: false,
          message: "Test not found",
        });
      }

      //  OPTIONS VALIDATION
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: "At least 2 options are required",
        });
      }

      //  CORRECT ANSWER VALIDATION
      if (!options.includes(correctAnswer)) {
        return res.status(400).json({
          success: false,
          message: "Correct answer must match one option",
        });
      }

      // CREATE QUESTION
      const newQuestion = await QuestionModel.create({
        test: testId,
        question,
        options,
        correctAnswer,
        explanation,
        marks,
        questionTime,
        createdBy: user._id,
        isActive: true,
      });
      await Testmodel.findByIdAndUpdate(testId, {
        isPublished: true,
      });
      //notification create
      await Notification.create({
        title: "New Test Published",
        message: "A new test is available now",
        type: "test",
      });
      const io = getIO();
      io.emit("newNotification", {
        title: "New Test Published",
        message: "A new test is available now",
        type: "test",
      });
      //  RESPONSE
      return res.status(201).json({
        success: true,
        message: "Question created successfully",
        data: newQuestion,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  //=====================
  //Get Question By Select Test Id
  //=====================
  async getQuestion(req, res) {
    try {
      const testId = req.params.testId;
      const user = req.user;
      const existTest = await Testmodel.findById(testId);
      if (!existTest) {
        return res.status(404).json({
          success: false,
          message: "Test not found",
        });
      }

      if (existTest.isPublished === false && user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only published tests are accessible",
        });
      }

      const questions = await QuestionModel.find({
        test: testId,
        isActive: true,
      })

        // .select("-correctAnswer")
        .sort({ createdAt: 1 });

      if (questions.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No questions found for this test",
        });
      }

      return res.status(200).json({
        success: true,
        totalQuestions: questions.length,
        data: questions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  ///===================
  ///Get All Question
  //====================
  async getAllQuestions(req, res) {
    try {
      const user = req.user;

      // optional: only admin can see all questions
      if (user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only admin can access all questions",
        });
      }

      const questions = await QuestionModel.find({
        isActive: true,
      })
        .populate("test", "title")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        totalQuestions: questions.length,
        data: questions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  // ===============================
  // UPDATE QUESTION
  // ===============================
  async updateQuestion(req, res) {
    try {
      //  GET USER
      const user = req.user;

      //  AUTH CHECK
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized user",
        });
      }

      // ROLE CHECK
      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only admin can update question",
        });
      }

      //  GET QUESTION ID
      const questionId = req.params.id;

      //  FIND QUESTION
      const questionData = await QuestionModel.findById(questionId);

      if (!questionData) {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      //  GET DATA
      const {
        question,
        options,
        correctAnswer,
        explanation,
        marks,
        questionTime,
      } = req.body;

      // OPTIONS VALIDATION
      if (options && options.length < 2) {
        return res.status(400).json({
          success: false,
          message: "At least 2 options required",
        });
      }

      //  CORRECT ANSWER VALIDATION
      if (options && correctAnswer && !options.includes(correctAnswer)) {
        return res.status(400).json({
          success: false,
          message: "Correct answer must match one option",
        });
      }

      //  UPDATE FIELDS
      if (question) questionData.question = question;

      if (options) questionData.options = options;

      if (correctAnswer) {
        questionData.correctAnswer = correctAnswer;
      }

      if (explanation) {
        questionData.explanation = explanation;
      }

      if (marks !== undefined) {
        questionData.marks = marks;
      }

      if (questionTime) {
        questionData.questionTime = questionTime;
      }

      // SAVE
      await questionData.save();

      //  RESPONSE
      return res.status(200).json({
        success: true,
        message: "Question updated successfully",
        data: questionData,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // ===============================
  // DELETE QUESTION
  // ===============================
  async deleteQuestion(req, res) {
    try {
      //  GET USER
      const user = req.user;

      //  AUTH CHECK
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized user",
        });
      }

      //  ROLE CHECK
      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only admin can delete question",
        });
      }

      //  GET QUESTION ID
      const questionId = req.params.id;

      //  FIND QUESTION
      const questionData = await QuestionModel.findById(questionId);

      if (!questionData) {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      //  DELETE QUESTION
      await QuestionModel.findByIdAndDelete(questionId);

      //  RESPONSE
      return res.status(200).json({
        success: true,
        message: "Question deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new questionController();
