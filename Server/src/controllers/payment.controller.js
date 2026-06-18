const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/payment.model");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const CourseProgress = require("../models/courseProgress.model");

exports.createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    if (!course.isPublished)
      return res.status(400).json({
        success: false,
        message: "Course is not available for purchase",
      });
    const alreadyEnrolled = course.studentsEnrolled.some(
      (s) => s.toString() === userId.toString(),
    );
    if (alreadyEnrolled)
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    const effectivePrice =
      course.price - Math.round((course.price * (course.discount || 0)) / 100);
    try {
      const order = await razorpay.orders.create({
        amount: effectivePrice * 100,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { courseId: courseId.toString(), userId: userId.toString() },
      });
      await Payment.create({
        user: userId,
        course: courseId,
        razorpayOrderId: order.id,
        amount: effectivePrice * 100,
        currency: "INR",
        status: "created",
      });
      return res.status(200).json({
        success: true,
        message: "Order created",
        data: {
          orderId: order.id,
          currency: order.currency,
          amount: order.amount,
          courseName: course.name,
          courseId: course._id,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      });
    } catch (razorpayError) {
      return res.status(500).json({
        success: false,
        message: razorpayError?.error?.description || razorpayError.message,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = req.body;
    const userId = req.user._id;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" },
      );
      return res.status(400).json({
        success: false,
        message: "Payment verification failed — invalid signature",
      });
    }
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
    );
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { studentsEnrolled: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });
    await CourseProgress.findOneAndUpdate(
      { user: userId, course: courseId },
      { user: userId, course: courseId },
      { upsert: true, new: true },
    );
    return res.status(200).json({
      success: true,
      message: "Payment verified and enrollment successful! 🎉",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("course", "name thumbnail price")
      .sort("-createdAt");
    return res
      .status(200)
      .json({ success: true, message: "Payment history", data: payments });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find()
        .populate("user", "firstName lastName email")
        .populate("course", "name price")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(),
    ]);
    return res.status(200).json({
      success: true,
      message: "All payments fetched",
      data: { payments, total },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};
