const express = require("express");
const router = express.Router();
const upload = require("../utils/Cloudinary.uplod");
const authController = require("../controller/auth.Controller");
const authCheck = require("../middleware/authChek");
const roleCheck = require("../middleware/roleCheck");
//register
router.post(
  "/auth/register",
  upload.single("profileImage"),
  authController.register,
);
//verify
router.get("/auth/verify/:token", authController.verification);
//resendVerificationlink
router.post("/resend/verification",authController.resendVerifyLink)
//login
router.post("/auth/login", authController.login);
//get user
router.get("/me",authCheck,authController.getUser)
//dashboard
router.get("/profile", authCheck, authController.Dashboard);
//profileupdate
router.put("/profile/update",authCheck,upload.single("profileImage"),authController.updateProfile)
//forgetpassword
router.post("/auth/forget-password",authController.forgetPassword)
//reset-password
router.post("/auth/reset-password/:token",authController.resetPassword)
//chanage password  when user login
router.post("/chanagepassword",authCheck,authController.changePassword)
// get all users (Admin only)
router.get("/auth/users", authCheck, roleCheck("admin"), authController.getAllUsers);
module.exports = router