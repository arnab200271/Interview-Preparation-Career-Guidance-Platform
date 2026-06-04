const express = require("express")
const router = express.Router()

const resultController = require("../controller/answer.Controller");

const authcheck = require("../middleware/authChek");

// SUBMIT TEST
router.post(
  "/submit/ans",
  authcheck,
  resultController.submitTest
);

// GET SINGLE RESULT
router.get(
  "/result/:id",
  authcheck,
  resultController.getSingleResult
);

// GET MY RESULTS
router.get(
  "/my-results",
  authcheck,
  resultController.getMyResults
);

// LEADERBOARD
router.get(
  "/leaderboard/:testId",
  authcheck,
  resultController.leaderboard
);

module.exports = router;