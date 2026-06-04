const mongoose = require("mongoose");
const CodingSubmission = require("../model/codingSubmission.Model");
const CodingQuestion = require("../model/codingQuestion.Model");
const CodingTest = require("../model/codingTest.Model");
const { executeTestCase } = require("../utils/jsExecutor");

// Classifies execution errors into standard programming interview verdicts
const classifyError = (errorMsg) => {
  if (!errorMsg) return "none";
  const msg = errorMsg.toLowerCase();
  if (msg.includes("timed out") || msg.includes("timeout")) {
    return "time_limit_exceeded";
  }
  if (msg.includes("syntaxerror") || msg.includes("unexpected token")) {
    return "compile_error";
  }
  return "runtime_error";
};

class codingSubmissionController {
  // ==========================================
  // RUN CODE (Candidate / Test Execution - Sandbox Run Only, No Save)
  // ==========================================
  // ==========================================
  // RUN CODE (Candidate / Test Execution - Sandbox Run Only, No Save)
  // ==========================================
  async runCode(req, res) {
    try {
      const codingTestId = req.body.codingTestId || req.body.testId;
      const submittedCode = req.body.submittedCode || req.body.code;
      const { questionId, language } = req.body;

      if (!codingTestId || !questionId || !submittedCode || !language) {
        return res.status(400).json({
          success: false,
          message:
            "codingTestId, questionId, submittedCode, and language are required fields",
        });
      }

      // Check language support
      if (language !== "javascript") {
        return res.status(400).json({
          success: false,
          message: "Run Code MVP supports javascript execution only",
        });
      }

      const question = await CodingQuestion.findById(questionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Coding question not found",
        });
      }

      // Only run against SAMPLE/PUBLIC test cases for "Run Code"
      const sampleTestCases = question.testCases.filter(
        (tc) => tc.isSample === true && tc.isHidden === false,
      );
      if (sampleTestCases.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No sample test cases defined for this question",
        });
      }

      const results = [];
      let passedCount = 0;

      for (const tc of sampleTestCases) {
        // Execute against sandbox
        const runOutcome = await executeTestCase(
          submittedCode,
          question.functionName,
          tc.input,
          tc.expectedOutput,
          question.timeLimit || 5000,
          language,
        );

        if (runOutcome.passed) {
          passedCount++;
        }

        results.push({
          testCaseId: tc._id,
          input: tc.input, // expose input/expected for sample test cases
          expectedOutput: tc.expectedOutput,
          actualOutput: runOutcome.actualOutput,
          expected: tc.expectedOutput,
          got: runOutcome.actualOutput,
          passed: runOutcome.passed,
          stdout: runOutcome.stdout,
          stderr: runOutcome.stderr,
          error: runOutcome.error,
          executionTime: runOutcome.executionTime,
        });
      }
      const firstResult = results[0];
      return res.status(200).json({
        success: true,
        message: "Code run completed",
        results: results,
        output: results.map((item) => ({
          input: item.input,
          output: item.actualOutput,
        })),
      });
    } catch (error) {
      console.error("Run Code Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during code execution",
        error: error.message,
      });
    }
  }

  // ==========================================
  // SUBMIT CODE (Runs All Tests & Saves to DB)
  // ==========================================
  async submitCode(req, res) {
    try {
      const codingTestId = req.body.codingTestId || req.body.testId;
      const submittedCode = req.body.submittedCode || req.body.code;
      const { questionId, language } = req.body;
      const userId = req.user.id || req.user._id;

      if (!codingTestId || !questionId || !submittedCode || !language) {
        return res.status(400).json({
          success: false,
          message:
            "codingTestId, questionId, submittedCode, and language are required fields",
        });
      }

      // Check language support
      if (language !== "javascript") {
        return res.status(400).json({
          success: false,
          message: "Submission MVP supports javascript execution only",
        });
      }

      const test = await CodingTest.findById(codingTestId);
      if (!test || !test.isActive) {
        return res.status(404).json({
          success: false,
          message: "Coding test not found or inactive",
        });
      }

      const question = await CodingQuestion.findById(questionId);
      if (!question || !question.isActive) {
        return res.status(404).json({
          success: false,
          message: "Coding question not found or inactive",
        });
      }

      // Verify language is supported by this question
      const supported =
        question.supportedLanguages && question.supportedLanguages.length > 0
          ? question.supportedLanguages
          : ["javascript"];

      if (!supported.includes(language)) {
        return res.status(400).json({
          success: false,
          message: `Language '${language}' is not supported for this question.`,
        });
      }

      const allTestCases = question.testCases;
      if (allTestCases.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No test cases configured for this question.",
        });
      }

      const testCaseResults = [];
      let passedCount = 0;
      let totalExecutionTime = 0;
      let maxExecutionTime = 0;
      let globalVerdict = "accepted"; // Default to accepted, falls back on failure
      let firstErrorOccurred = null;

      for (const tc of allTestCases) {
        const runOutcome = await executeTestCase(
          submittedCode,
          question.functionName,
          tc.input,
          tc.expectedOutput,
          question.timeLimit || 5000,
          language,
        );

        if (runOutcome.passed) {
          passedCount++;
        } else {
          // If a test case fails, we update the global verdict
          if (runOutcome.error) {
            const errorType = classifyError(runOutcome.error);
            // Prioritize time limits/compilation crashes
            if (
              globalVerdict === "accepted" ||
              globalVerdict === "wrong_answer"
            ) {
              globalVerdict = errorType;
            }
            if (!firstErrorOccurred) {
              firstErrorOccurred = runOutcome.error;
            }
          } else {
            if (globalVerdict === "accepted") {
              globalVerdict = "wrong_answer";
            }
          }
        }

        totalExecutionTime += runOutcome.executionTime;
        maxExecutionTime = Math.max(maxExecutionTime, runOutcome.executionTime);

        // Map granular results. Omit input/output logs for hidden test cases
        testCaseResults.push({
          testCaseId: tc._id,
          passed: runOutcome.passed,
          stdout: runOutcome.stdout,
          stderr: runOutcome.stderr,
          error: runOutcome.error,
          actualOutput: runOutcome.actualOutput,
          got: runOutcome.actualOutput,
          expected: tc.expectedOutput,
          executionTime: runOutcome.executionTime,
        });
      }

      // Calculate score and percentages
      const totalTestCasesCount = allTestCases.length;
      const passRate = passedCount / totalTestCasesCount;
      const score = Math.round(question.marks * passRate);
      const percentage = Math.round(passRate * 100);

      // Determine final result status
      if (passedCount === totalTestCasesCount) {
        globalVerdict = "accepted";
      } else if (passedCount > 0 && globalVerdict === "wrong_answer") {
        globalVerdict = "partially_accepted";
      }

      // Create submission record
      const submission = await CodingSubmission.create({
        user: userId,
        codingTest: codingTestId,
        question: questionId,
        submittedCode,
        language,
        passedTestCases: passedCount,
        totalTestCases: totalTestCasesCount,
        score,
        totalMarks: question.marks,
        percentage,
        executionTime: maxExecutionTime, // use max execution time for safety
        status: "completed",
        finalResult: globalVerdict,
        submittedAt: new Date(),
        testCaseResults,
      });

      return res.status(201).json({
        success: true,
        message: "Code submitted and evaluated successfully",
        data: {
          submissionId: submission._id,
          finalResult: submission.finalResult,
          passedTestCases: submission.passedTestCases,
          totalTestCases: submission.totalTestCases,
          passed: submission.passedTestCases,
          total: submission.totalTestCases,
          testsPassed: submission.passedTestCases,
          testsTotal: submission.totalTestCases,
          score: submission.score,
          totalMarks: submission.totalMarks,
          percentage: submission.percentage,
          executionTime: submission.executionTime,
          // Do NOT expose expectedOutputs or inputs of hidden test cases in response
          results: testCaseResults.map((res, i) => {
            const originalTc = allTestCases[i];
            return {
              passed: res.passed,
              executionTime: res.executionTime,
              stdout: res.stdout,
              stderr: res.stderr,
              error: res.error,
              isSample: originalTc.isSample,
              isHidden: originalTc.isHidden,
              // Only include inputs/outputs if it's a public sample test case
              input: originalTc.isSample ? originalTc.input : undefined,
              expectedOutput: originalTc.isSample
                ? originalTc.expectedOutput
                : undefined,
              expected: originalTc.isSample
                ? originalTc.expectedOutput
                : undefined,
              got: originalTc.isSample ? res.got : undefined,
            };
          }),
        },
      });
    } catch (error) {
      console.error("Submit Code Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during code submission",
        error: error.message,
      });
    }
  }

  // ==========================================
  // SAVE SUBMISSION RESULT (Webhook / Direct Save API)
  // ==========================================
  async saveSubmissionResult(req, res) {
    try {
      const {
        userId,
        codingTestId,
        questionId,
        submittedCode,
        language,
        passedTestCases,
        totalTestCases,
        score,
        totalMarks,
        percentage,
        executionTime,
        status,
        finalResult,
        judge0Token,
        judge0StatusId,
      } = req.body;

      const callerId = req.user.id || req.user._id;
      // If caller is admin, allow saving for another user, otherwise use caller's user id
      const targetUserId =
        req.user.role === "admin" && userId ? userId : callerId;

      if (!codingTestId || !questionId || !submittedCode || !language) {
        return res.status(400).json({
          success: false,
          message:
            "codingTestId, questionId, submittedCode, and language are required fields",
        });
      }

      const submission = await CodingSubmission.create({
        user: targetUserId,
        codingTest: codingTestId,
        question: questionId,
        submittedCode,
        language,
        passedTestCases: passedTestCases || 0,
        totalTestCases: totalTestCases || 0,
        score: score || 0,
        totalMarks: totalMarks || 0,
        percentage: percentage || 0,
        executionTime: executionTime || 0,
        status: status || "completed",
        finalResult: finalResult || "none",
        submittedAt: new Date(),
        judge0Token,
        judge0StatusId,
      });

      return res.status(201).json({
        success: true,
        message: "Submission result saved successfully",
        data: submission,
      });
    } catch (error) {
      console.error("Save Submission Result Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error saving submission",
        error: error.message,
      });
    }
  }

  // ==========================================
  // GET USER SUBMISSIONS (Authenticated)
  // ==========================================
  async getUserSubmissions(req, res) {
    try {
      const userId = req.user.id || req.user._id;
      const userRole = req.user.role;
      const { testId, questionId, targetUser } = req.query;

      let filter = {};

      // If user is candidate, restrict to their own submissions
      if (userRole !== "admin") {
        filter.user = userId;
      } else if (targetUser) {
        filter.user = targetUser; // Admin can filter by user
      }

      if (testId) {
        filter.codingTest = testId;
      }

      if (questionId) {
        filter.question = questionId;
      }

      const submissions = await CodingSubmission.find(filter)
        .populate("codingTest", "title slug")
        .populate("question", "title slug difficulty marks")
        .populate("user", "name email")
        .sort({ submittedAt: -1 });

      return res.status(200).json({
        success: true,
        total: submissions.length,
        data: submissions,
      });
    } catch (error) {
      console.error("Get User Submissions Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error retrieving submissions",
        error: error.message,
      });
    }
  }

  // ==========================================
  // LEADERBOARD (Authenticated)
  // ==========================================
  async getLeaderboard(req, res) {
    try {
      const { testId } = req.params;

      if (!testId) {
        return res.status(400).json({
          success: false,
          message: "testId path parameter is required",
        });
      }

      const testExists = await CodingTest.findById(testId);
      if (!testExists) {
        return res.status(404).json({
          success: false,
          message: "Coding test not found",
        });
      }

      // Aggregation Pipeline to score based on candidate's best attempt per question
      const leaderboard = await CodingSubmission.aggregate([
        // 1. Match submissions for the specific test
        {
          $match: {
            codingTest: new mongoose.Types.ObjectId(testId),
            status: "completed",
          },
        },
        // 2. Sort by user, question, and score descending (best attempt first)
        {
          $sort: {
            user: 1,
            question: 1,
            score: -1,
            executionTime: 1, // break tie with faster execution
          },
        },
        // 3. Group by user & question to grab their best submission
        {
          $group: {
            _id: {
              user: "$user",
              question: "$question",
            },
            maxScore: { $first: "$score" },
            executionTime: { $first: "$executionTime" },
            submittedAt: { $first: "$submittedAt" },
          },
        },
        // 4. Group by user to aggregate score across all test questions
        {
          $group: {
            _id: "$_id.user",
            totalScore: { $sum: "$maxScore" },
            totalExecutionTime: { $sum: "$executionTime" },
            lastSubmission: { $max: "$submittedAt" },
          },
        },
        // 5. Lookup user details
        {
          $lookup: {
            from: "users", // collection name for User model
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        // 6. Unwind user details array
        {
          $unwind: "$userInfo",
        },
        // 7. Format details
        {
          $project: {
            _id: 0,
            userId: "$_id",
            name: "$userInfo.name",
            email: "$userInfo.email",
            profileImage: "$userInfo.profileImage",
            totalScore: 1,
            totalExecutionTime: 1,
            lastSubmission: 1,
          },
        },
        // 8. Sort by score (desc), execution time (asc), and submission time (asc)
        {
          $sort: {
            totalScore: -1,
            totalExecutionTime: 1,
            lastSubmission: 1,
          },
        },
      ]);

      // Assign ranks in JavaScript (ensures robust database engine compatibility)
      const rankedLeaderboard = leaderboard.map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

      return res.status(200).json({
        success: true,
        test: {
          id: testExists._id,
          title: testExists.title,
          totalMarks: testExists.totalMarks,
        },
        leaderboard: rankedLeaderboard,
      });
    } catch (error) {
      console.error("Get Leaderboard Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error fetching leaderboard",
        error: error.message,
      });
    }
  }
}

module.exports = new codingSubmissionController();
