const express = require("express");
const router = express.Router();
const { signup, verifyOtp,resendOtp, resetPassword, forgotPassword, login,changePassword } = require("../controllers/authController");

const {authMiddleware} = require("../middleware/auth.middleware");

// ✅ Signup route
router.post("/signup", signup);

// ✅ Verify OTP route
router.post("/verify-otp", verifyOtp);

// ✅ Resend OTP route
router.post("/resend-otp", resendOtp);

// ✅ Forgot Password route
router.post("/forgot-password", forgotPassword);

// ✅ Reset Password route
router.post("/reset-password", resetPassword);

// ✅ Change Password route (Protected)
router.post("/change-password", authMiddleware, changePassword);


// ✅ Login route
router.post("/login", login);



module.exports = router;