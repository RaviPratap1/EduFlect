const Course = require("../models/course.model");
const Category = require("../models/category.model");
const RatingAndReview = require("../models/ratingAndReview.model");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinary.service");

exports.getAllCourses = async (req, res) => {
  try {
    const {
      category,
      search,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };
    const skip = (Number(page) - 1) * Number(limit);
    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("instructor", "firstName lastName profile")
        .populate("category", "name")
        .select("-sections")
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(Number(limit)),
      Course.countDocuments(filter),
    ]);
    const coursesWithRating = await Promise.all(
      courses.map(async (course) => {
        const ratings = await RatingAndReview.find({ course: course._id });
        const avg = ratings.length
          ? (
              ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
            ).toFixed(1)
          : 0;
        const obj = course.toObject();
        obj.averageRating = Number(avg);
        obj.totalRatings = ratings.length;
        obj.totalStudents = course.studentsEnrolled.length;
        return obj;
      }),
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Courses fetched",
        data: {
          courses: coursesWithRating,
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
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

exports.getCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId)
      .populate("instructor", "firstName lastName profile email")
      .populate("category", "name description")
      .populate({
        path: "sections",
        populate: { path: "subSections" },
        options: { sort: { order: 1 } },
      })
      .populate({
        path: "ratingAndReviews",
        populate: { path: "user", select: "firstName lastName profile" },
      });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    const ratings = course.ratingAndReviews;
    const avg = ratings.length
      ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
      : 0;
    const courseObj = course.toObject();
    courseObj.averageRating = Number(avg);
    courseObj.totalRatings = ratings.length;
    courseObj.totalStudents = course.studentsEnrolled.length;
    return res
      .status(200)
      .json({ success: true, message: "Course fetched", data: courseObj });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate("category", "name")
      .populate({ path: "sections", populate: { path: "subSections" } })
      .sort("-createdAt");
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const ratings = await RatingAndReview.find({ course: course._id });
        const avg = ratings.length
          ? (
              ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
            ).toFixed(1)
          : 0;
        const obj = course.toObject();
        obj.averageRating = Number(avg);
        obj.totalStudents = course.studentsEnrolled.length;
        obj.revenue =
          course.studentsEnrolled.length *
          (course.price - (course.price * (course.discount || 0)) / 100);
        return obj;
      }),
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Courses fetched",
        data: coursesWithStats,
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

exports.createCourse = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discount,
      level,
      language,
      whatYouWillLearn,
      requirements,
    } = req.body;
    const existingCategory = await Category.findById(category);
    if (!existingCategory)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    let thumbnailUrl = null,
      thumbnailPublicId = null;
    if (req.file) {
      const uploaded = await uploadOnCloudinary(req.file.path);
      if (uploaded) {
        thumbnailUrl = uploaded.secure_url;
        thumbnailPublicId = uploaded.public_id;
      }
    }
    const course = await Course.create({
      name,
      description,
      thumbnail: thumbnailUrl,
      thumbnailPublicId,
      instructor: req.user._id,
      category,
      price: Number(price),
      discount: Number(discount) || 0,
      level,
      language,
      whatYouWillLearn: whatYouWillLearn ? JSON.parse(whatYouWillLearn) : [],
      requirements: requirements ? JSON.parse(requirements) : [],
    });
    return res
      .status(201)
      .json({
        success: true,
        message: "Course created successfully",
        data: course,
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

exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You don't have permission to update this course",
        });
    }
    const {
      name,
      description,
      category,
      price,
      discount,
      level,
      language,
      isPublished,
      whatYouWillLearn,
      requirements,
    } = req.body;
    if (req.file) {
      if (course.thumbnailPublicId)
        await deleteFromCloudinary(course.thumbnailPublicId);
      const uploaded = await uploadOnCloudinary(req.file.path);
      if (uploaded) {
        course.thumbnail = uploaded.secure_url;
        course.thumbnailPublicId = uploaded.public_id;
      }
    }
    if (name) course.name = name;
    if (description) course.description = description;
    if (category) course.category = category;
    if (price !== undefined) course.price = Number(price);
    if (discount !== undefined) course.discount = Number(discount);
    if (level) course.level = level;
    if (language) course.language = language;
    if (isPublished !== undefined)
      course.isPublished = isPublished === "true" || isPublished === true;
    if (whatYouWillLearn)
      course.whatYouWillLearn = JSON.parse(whatYouWillLearn);
    if (requirements) course.requirements = JSON.parse(requirements);
    await course.save();
    return res
      .status(200)
      .json({ success: true, message: "Course updated", data: course });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You don't have permission to delete this course",
        });
    }
    if (course.thumbnailPublicId)
      await deleteFromCloudinary(course.thumbnailPublicId);
    await Course.findByIdAndDelete(courseId);
    return res.status(200).json({ success: true, message: "Course deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Permission denied" });
    }
    course.isPublished = !course.isPublished;
    await course.save();
    return res
      .status(200)
      .json({
        success: true,
        message: `Course ${course.isPublished ? "published" : "unpublished"}`,
        data: { isPublished: course.isPublished },
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

exports.adminGetAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "firstName lastName email")
      .populate("category", "name")
      .sort("-createdAt");
    return res
      .status(200)
      .json({ success: true, message: "All courses fetched", data: courses });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};
