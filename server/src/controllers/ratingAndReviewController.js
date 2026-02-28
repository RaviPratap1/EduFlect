const RatingAndReview = require("../models/ratingAndReviewModel");
const Course = require("../models/courseModel");

exports.createRatingAndReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { rating, review, courseId } = req.body;

    // 1️⃣ Validate input
    if (!rating || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Rating and CourseId are required",
      });
    }

    // 2️⃣ Check course exist
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 3️⃣ Check user enrolled
    if (!course.studentsEnrolled.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in the course to review",
      });
    }

    // 4️⃣ Check already reviewed
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    // 5️⃣ Create review
    const ratingReview = await RatingAndReview.create({
      user: userId,
      rating,
      review,
      course: courseId,
    });

    // 6️⃣ Push review into course
    course.ratingAndReviews.push(ratingReview._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Rating and Review created successfully",
      ratingReview,
    });

  } catch (error) {
    console.error("Create Rating Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await RatingAndReview.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: "$course",
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        averageRating: 0,
      });
    }

    res.status(200).json({
      success: true,
      averageRating: result[0].averageRating,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};