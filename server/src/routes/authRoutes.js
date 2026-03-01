// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyOrders,
} = require("../controllers/paymentController");
const {
  authMiddleware,
  studentMiddleware,
} = require("../middleware/auth.middleware");

// Order create — sirf student
router.post(
  "/create-order",
  authMiddleware,
  studentMiddleware,
  createOrder
);

// Payment verify — sirf student
router.post(
  "/verify-payment",
  authMiddleware,
  studentMiddleware,
  verifyPayment
);

// My orders — koi bhi logged in user
router.get(
  "/my-orders",
  authMiddleware,
  getMyOrders
);

module.exports = router;