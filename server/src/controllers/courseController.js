const Course = require("../models/courseModel");
const Category = require("../models/categoryModel");
const { uploadToCloudinary } = require("../utils/cloudinaryUploader");

// ============================
// CREATE COURSE
// ============================
exports.createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseDescription,
      price,
      discountPrice,
      category,
      whatYouWillLearn,
      tags,
      status,
    } = req.body;

    console.log("REQ USER ID:", req.user._id);

    // Validation
    if (!courseName || !courseDescription || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Thumbnail required
    if (!req.files || !req.files.thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image is required",
      });
    }

    // Upload thumbnail
    const thumbnailFile = req.files.thumbnail;
    const thumbnailUpload = await uploadToCloudinary(
      thumbnailFile,
      "courses"
    );

    console.log("Logged In User (req.user):", req.user);

    // Create course
    const course = await Course.create({
      courseName,
      courseDescription,
      instructor: req.user._id,
      price,
      discountPrice: discountPrice || 0,
      category,
      whatYouWillLearn,
      tags,
      status,
      thumbnail: thumbnailUpload.secure_url,
    });

    console.log("Saved Course Instructor:", course.instructor);

    // Add course to category
    await Category.findByIdAndUpdate(category, {
      $push: { courses: course._id },
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ============================
// GET ALL COURSES
// ============================
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("category", "name")
      .populate("instructor", "name email");

    res.status(200).json({ success: true, courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ============================
// GET SINGLE COURSE
// ============================
exports.getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("courseId", id);



    const course = await Course.findById(id)
      .populate("category")
      .populate("instructor", "name email")
      .populate({
        path: "courseContent",        // sections
        populate: {
          path: "subSection",         // har section ke lectures
        },
      })
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "user",
          select: "name email",
        },
      });


    console.log(course);


    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({ success: true, course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ============================
// UPDATE COURSE
// ============================
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Only instructor or admin
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const oldCategory = course.category?.toString();
    const newCategory = req.body.category;

    // If thumbnail update
    if (req.files && req.files.thumbnail) {
      const thumbnailUpload = await uploadToCloudinary(
        req.files.thumbnail,
        "courses"
      );
      req.body.thumbnail = thumbnailUpload.secure_url;
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    // If category changed
    if (newCategory && oldCategory !== newCategory) {
      await Category.findByIdAndUpdate(oldCategory, {
        $pull: { courses: id },
      });

      await Category.findByIdAndUpdate(newCategory, {
        $push: { courses: id },
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      updatedCourse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ============================
// DELETE COURSE
// ============================
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    // Remove from category
    await Category.findByIdAndUpdate(course.category, {
      $pull: { courses: id },
    });

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ============================
// ENROLL COURSE
// ============================
exports.enrollCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Prevent duplicate enrollment
    if (course.studentsEnrolled.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled",
      });
    }

    course.studentsEnrolled.push(req.user._id);
    await course.save();

    res.status(200).json({
      success: true,
      message: "Enrolled successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};