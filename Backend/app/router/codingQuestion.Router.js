const router = require("express").Router();
const codingQuestionController = require("../controller/codingQuestion.Controller");
const authcheck = require("../middleware/authChek");
const Rolecheck = require("../middleware/roleCheck");

// CREATE CODING QUESTION
router.post(
  "/coding-question/create",
  authcheck,
  Rolecheck("admin"),
  codingQuestionController.createCodingQuestion
);

// UPDATE CODING QUESTION
router.patch(
  "/coding-question/update/:id",
  authcheck,
  Rolecheck("admin"),
  codingQuestionController.updateCodingQuestion
);

// DELETE CODING QUESTION
router.delete(
  "/coding-question/delete/:id",
  authcheck,
  Rolecheck("admin"),
  codingQuestionController.deleteCodingQuestion
);

// GET QUESTIONS BY TEST
router.get(
  "/coding-question/test/:testId",
  authcheck,
  codingQuestionController.getQuestionsByTest
);
router.get(
  "/coding-question/all",
  authcheck,
  Rolecheck("admin"),
  codingQuestionController.getAllCodingQuestions
);

module.exports = router;
