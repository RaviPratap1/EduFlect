// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

// OTP ke liye — 5 requests per 10 minutes
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many requests. Please try after 10 minutes."
  }
});

// Login ke liye — 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try after 15 minutes."
  }
});

module.exports = { otpLimiter, loginLimiter };