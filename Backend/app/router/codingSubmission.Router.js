const router = require("express").Router();
const codingSubmissionController = require("../controller/codingSubmission.Controller");
const authcheck = require("../middleware/authChek");

// RUN CODE (Sandbox Run - Sample Tests Only)
router.post(
  "/coding-submission/run",
  authcheck,
  codingSubmissionController.runCode
);

// SUBMIT CODE (Runs All Tests & Saves to DB)
router.post(
  "/coding-submission/submit",
  authcheck,
  codingSubmissionController.submitCode
);

// SAVE SUBMISSION RESULT (Simulated Webhook / Async Save)
router.post(
  "/coding-submission/save",
  authcheck,
  codingSubmissionController.saveSubmissionResult
);

// GET USER SUBMISSIONS (Query filter: testId, questionId, targetUser)
router.get(
  "/coding-submission/history",
  authcheck,
  codingSubmissionController.getUserSubmissions
);

// GET CODING TEST LEADERBOARD
router.get(
  "/coding-test/:testId/leaderboard",
  codingSubmissionController.getLeaderboard
);

module.exports = router;
