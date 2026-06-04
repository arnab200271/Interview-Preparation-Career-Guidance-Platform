const router = require("express").Router();
const jwt = require("jsonwebtoken");
const codingTestController = require("../controller/codingTest.Controller");
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

// CREATE CODING TEST
router.post(
  "/coding-test/create",
  authcheck,
  Rolecheck("admin"),
  codingTestController.createCodingTest
);

// UPDATE CODING TEST
router.put(
  "/coding-test/update/:id",
  authcheck,
  Rolecheck("admin"),
  codingTestController.updateCodingTest
);

// DELETE CODING TEST
router.delete(
  "/coding-test/delete/:id",
  authcheck,
  Rolecheck("admin"),
  codingTestController.deleteCodingTest
);

// GET ALL CODING TESTS
router.get(
  "/coding-test/all",
   optionalAuth,
   codingTestController.getAllCodingTests
);

// GET SINGLE CODING TEST
router.get(
  "/coding-test/single/:id",
 authcheck,
  codingTestController.getSingleCodingTest
);

module.exports = router;
