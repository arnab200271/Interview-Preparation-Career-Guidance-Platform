const router = require("express").Router();
const jwt = require("jsonwebtoken");

const testController = require("../controller/test.Controller");

const authcheck = require("../middleware/authChek");
const Rolecheck = require("../middleware/roleCheck");

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      // Ignore invalid token, treat as guest
    }
  }
  next();
};

// CREATE TEST
router.post(
  "/create/test",
  authcheck,
  Rolecheck("admin"),
  testController.createTest,
);

// GET ALL TESTS
router.get("/test", optionalAuth, testController.getTests);

// GET SINGLE TEST
router.get("/single/test/:id", authcheck,  testController.getSingleTest);

// UPDATE TEST
router.put(
  "/update/test/:id",
  authcheck,
  Rolecheck("admin"),
  testController.Updatetest,
);

// DELETE TEST
router.delete(
  "/delete/test/:id",
  authcheck,
  Rolecheck("admin"),
  testController.deleteTest,
);

module.exports = router;
