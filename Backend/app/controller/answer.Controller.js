const ResultModel = require("../model/answer.Model");
const QuestionModel = require("../model/question.model");
const Testmodel = require("../model/test.Model");

class resultController {
  // ===================================
  // SUBMIT TEST
  // ===================================
  async submitTest(req, res) {
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

      //  GET DATA
      const { testId, answers, timeTaken } = req.body;

      //  VALIDATION
      if (!testId || !answers || answers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Test ID and answers are required",
        });
      }

      //  FIND TEST
      const test = await Testmodel.findById(testId);

      if (!test) {
        return res.status(404).json({
          success: false,
          message: "Test not found",
        });
      }

      // GET ALL QUESTIONS OF THIS TEST
      const questions = await QuestionModel.find({
        test: testId,
        isActive: true,
      });

      //  VARIABLES
      let score = 0;
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let skippedQuestions = 0;

      const answerDetails = [];

      // Build a set of answered question IDs for skip detection
      const answeredQuestionIds = new Set(
        answers.map((a) => a.questionId)
      );

      //  CHECK ANSWERS
      for (const answer of answers) {
        // FIND QUESTION
        const question = questions.find(
          (q) => q._id.toString() === answer.questionId,
        );

        // QUESTION NOT FOUND
        if (!question) continue;

        // SKIPPED: selectedAnswer is empty string (user pressed Skip)
        if (!answer.selectedAnswer || answer.selectedAnswer.trim() === "") {
          skippedQuestions++;
          continue;
        }

        // CHECK ANSWER
        const isCorrect = question.correctAnswer === answer.selectedAnswer;

        // SCORE CALCULATION
        if (isCorrect) {
          correctAnswers++;
          score += question.marks;
        } else {
          wrongAnswers++;
        }

        // SAVE ANSWER DETAILS
        answerDetails.push({
          question: question._id,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
        });
      }

      //  TOTAL QUESTIONS
      const totalQuestions = questions.length;

      // Add questions that were never sent at all (e.g. exam ended early)
      const neverAnswered = questions.filter(
        (q) => !answeredQuestionIds.has(q._id.toString())
      ).length;
      skippedQuestions += neverAnswered;

      //  PERCENTAGE
      const percentage = (score / (totalQuestions || 1)) * 100;

      // PASS / FAIL
      const status = percentage >= 40 ? "pass" : "fail";

      //  SAVE RESULT
      const result = await ResultModel.create({
        user: user.id,
        test: testId,
        answers: answerDetails,
        score,
        correctAnswers,
        wrongAnswers,
        skippedQuestions,
        totalQuestions,
        timeTaken,
        percentage,
        status,
      });

      //  RESPONSE
      return res.status(201).json({
        success: true,
        message: "Test submitted successfully",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  // ===================================
  // GET SINGLE RESULT
  // ===================================
  async getSingleResult(req, res) {
    try {
      //  GET RESULT ID
      const resultId = req.params.id;

      //  GET USER
      const user = req.user;

      //  FIND RESULT
      const result = await ResultModel.findById(resultId)
        .populate("user", "name email")
        .populate("test", "title category")
        .populate("answers.question", "question options");

      //  RESULT NOT FOUND
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Result not found",
        });
      }

      //  OWNERSHIP CHECK
      if (result.user._id.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // RESPONSE
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // ===================================
  // GET MY RESULTS
  // ===================================
  async getMyResults(req, res) {
    try {
      //  GET USER
      const user = req.user;

      //  FIND RESULTS
      const results = await ResultModel.find({
        user: user.id,
      })
        .populate("test", "title difficulty duration")
        .sort({ createdAt: -1 });

      //  RESPONSE
      return res.status(200).json({
        success: true,
        total: results.length,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // ===================================
  // LEADERBOARD
  // ===================================
  async leaderboard(req, res) {
    try {
      //  GET TEST ID
      const testId = req.params.testId;

      //  LEADERBOARD AGGREGATION
      const leaderboard = await ResultModel.aggregate([
        // MATCH TEST
        {
          $match: {
            test: new mongoose.Types.ObjectId(testId),
          },
        },

        // SORT BY SCORE
        {
          $sort: {
            score: -1,
            timeTaken: 1,
          },
        },

        // LIMIT TOP 10
        {
          $limit: 10,
        },

        // USER LOOKUP
        {
          $lookup: {
            from: "Users",
            localField: "Users",
            foreignField: "_id",
            as: "Users",
          },
        },

        // UNWIND USER
        {
          $unwind: "$Users",
        },

        // FINAL FIELDS
        {
          $project: {
            score: 1,
            percentage: 1,
            correctAnswers: 1,
            timeTaken: 1,
            createdAt: 1,

            "user.name": 1,
            "user.email": 1,
          },
        },
      ]);

      // 3. RESPONSE
      return res.status(200).json({
        success: true,
        total: leaderboard.length,
        data: leaderboard,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new resultController();
