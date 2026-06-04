const express = require("express");
const router = express.Router();
const analyticsController = require("../controller/analytics.Controller");
const authCheck = require("../middleware/authChek");
const roleCheck = require("../middleware/roleCheck");

// GET /api/v1/admin/analytics - Only accessible by authenticated administrators
router.get(
  "/admin/analytics",
  authCheck,
  roleCheck("admin"),
  analyticsController.getAnalytics
);

module.exports = router;
