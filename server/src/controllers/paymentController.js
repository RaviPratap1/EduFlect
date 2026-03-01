// controllers/paymentController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Course = require("../models/courseModel");
const User = require("../models/user.model");
const Order = require("../models/orderModel");
const AppError = require("../utils/AppError");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ============================
// STEP 1 — Create Order
// ============================
exports.createOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return next(new AppError("Course ID required", 400));
    }

    // Course exist karta hai?
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError("Course not found", 404));
    }

    // Published hai?
    if (course.status !== "Published") {
      return next(new AppError("Course not available", 400));
    }

    // Already enrolled?
    if (course.studentsEnrolled.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // Free course — directly enroll karo
    if (course.price === 0) {
      await Course.findByIdAndUpdate(courseId, {
        $push: { studentsEnrolled: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { courses: courseId },
      });
      return res.status(200).json({
        success: true,
        message: "Enrolled successfully (Free Course)",
      });
    }

    // Paid course — Razorpay order banao
    const razorpayOrder = await razorpay.orders.create({
      amount: course.price * 100, // paise mein convert
      currency: "INR",
      receipt: `receipt_${courseId}_${req.user._id}`,
      notes: {
        courseId: courseId.toString(),
        userId: req.user._id.toString(),
      },
    });

    // DB mein order save karo
    const order = await Order.create({
      user: req.user._id,
      course: courseId,
      razorpayOrderId: razorpayOrder.id,
      amount: course.price,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      courseName: course.courseName,
      courseId: course._id,
      dbOrderId: order._id,
    });
  } catch (err) {
    next(err);
  }
};

// ============================
// STEP 2 — Verify Payment
// ============================
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      return next(new AppError("All payment fields required", 400));
    }

    // Signature verify karo — payment genuine hai ya nahi
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Payment fake hai — order failed mark karo
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      return next(new AppError("Payment verification failed", 400));
    }

    // ✅ Payment genuine hai

    // Order update karo
    await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        status: "paid",
      }
    );

    // Course mein student add karo
    await Course.findByIdAndUpdate(courseId, {
      $push: { studentsEnrolled: req.user._id },
    });

    // User mein course add karo
    await User.findByIdAndUpdate(req.user._id, {
      $push: { courses: courseId },
    });

    res.status(200).json({
      success: true,
      message: "Payment successful! Enrolled in course.",
    });
  } catch (err) {
    next(err);
  }
};

// ============================
// STEP 3 — Get My Orders
// ============================
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("course", "courseName thumbnail price");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    next(err);
  }
};