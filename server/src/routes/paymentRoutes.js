const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  freeEnroll,
  getRazorpayKey,
} = require("../controllers/paymentController");

const {
  authMiddleware,
  studentMiddleware,
} = require("../middleware/auth.middleware");

// ── Public ────────────────────────────────────────────────────
// Frontend ko Razorpay Key ID dena (secret nahi)
router.get("/key", getRazorpayKey);

// ── Protected (student only) ──────────────────────────────────

// Free course mein direct enroll
router.post("/free-enroll", authMiddleware, studentMiddleware, freeEnroll);

// Step 1: Razorpay order create karo
router.post("/create-order", authMiddleware, studentMiddleware, createOrder);

// Step 2: Payment verify karo + enroll karo
router.post("/verify", authMiddleware, studentMiddleware, verifyPayment);

module.exports = router;
