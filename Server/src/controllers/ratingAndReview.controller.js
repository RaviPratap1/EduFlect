const RatingAndReview = require("../models/ratingAndReview.model");
const Course = require("../models/course.model");

exports.createRating = async (req, res) => {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req.user._id;
    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    const isEnrolled = course.studentsEnrolled.some(
      (s) => s.toString() === userId.toString(),
    );
    if (!isEnrolled)
      return res
        .status(403)
        .json({
          success: false,
          message: "You must be enrolled in this course to leave a review",
        });
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed)
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already reviewed this course",
        });
    const ratingReview = await RatingAndReview.create({
      user: userId,
      course: courseId,
      rating,
      review,
    });
    await Course.findByIdAndUpdate(courseId, {
      $push: { ratingAndReviews: ratingReview._id },
    });
    return res
      .status(201)
      .json({ success: true, message: "Review added", data: ratingReview });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = await RatingAndReview.find({ course: courseId })
      .populate("user", "firstName lastName profile")
      .sort("-createdAt");
    const avg = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    return res
      .status(200)
      .json({
        success: true,
        message: "Reviews fetched",
        data: { reviews, averageRating: Number(avg), total: reviews.length },
      });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await RatingAndReview.findById(reviewId);
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    if (
      req.user.role !== "admin" &&
      review.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You can only delete your own review",
        });
    }
    await RatingAndReview.findByIdAndDelete(reviewId);
    await Course.findByIdAndUpdate(review.course, {
      $pull: { ratingAndReviews: reviewId },
    });
    return res.status(200).json({ success: true, message: "Review deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await RatingAndReview.find({ rating: { $gte: 4 } })
      .populate("user", "firstName lastName profile")
      .populate("course", "name thumbnail")
      .sort("-createdAt")
      .limit(10);
    return res
      .status(200)
      .json({ success: true, message: "Reviews fetched", data: reviews });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await RatingAndReview.find({ user: req.user._id }).populate(
      "course",
      "name thumbnail",
    );
    return res
      .status(200)
      .json({ success: true, message: "My reviews", data: reviews });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};
