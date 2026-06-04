const express = require("express");
const router = express.Router();
const questionController = require("../controller/question.Controller");
const authcheck = require("../middleware/authChek");
const Rolecheck = require("../middleware/roleCheck");

// CREATE QUESTION
router.post(
  "/create/question",
  authcheck,
  Rolecheck("admin"),
  questionController.createQuestion,
);

// GET QUESTIONS BY TEST
router.get("/test/:testId", authcheck, questionController.getQuestion);
///Get All Question
router.get("/questions/all",authcheck,Rolecheck("admin"),questionController.getAllQuestions);
// UPDATE QUESTION
router.put(
  "/update/question/:id",
  authcheck,
  Rolecheck("admin"),
  questionController.updateQuestion,
);

// DELETE QUESTION
router.delete(
  "/delete/question/:id",
  authcheck,
  Rolecheck("admin"),
  questionController.deleteQuestion,
);

module.exports = router;
