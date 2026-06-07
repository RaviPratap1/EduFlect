const CourseProgress = require("../models/courseProgress.model");
const Course = require("../models/course.model");

exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const course = await Course.findById(courseId).populate({
      path: "sections",
      populate: { path: "subSections" },
    });
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
          message: "You are not enrolled in this course",
        });
    let progress = await CourseProgress.findOne({
      user: userId,
      course: courseId,
    });
    if (!progress)
      progress = await CourseProgress.create({
        user: userId,
        course: courseId,
      });
    let totalSubSections = 0;
    course.sections.forEach((s) => {
      totalSubSections += s.subSections.length;
    });
    const completionPercentage =
      totalSubSections > 0
        ? Math.round(
            (progress.completedSubSections.length / totalSubSections) * 100,
          )
        : 0;
    progress.completionPercentage = completionPercentage;
    progress.lastAccessed = new Date();
    progress.isCompleted = completionPercentage === 100;
    await progress.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Progress fetched",
        data: {
          progress,
          course: {
            _id: course._id,
            name: course.name,
            sections: course.sections,
          },
          totalSubSections,
          completedCount: progress.completedSubSections.length,
          completionPercentage,
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

exports.markSubSectionComplete = async (req, res) => {
  try {
    const { courseId, subSectionId } = req.body;
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
          message: "You are not enrolled in this course",
        });
    let progress = await CourseProgress.findOne({
      user: userId,
      course: courseId,
    });
    if (!progress)
      progress = await CourseProgress.create({
        user: userId,
        course: courseId,
      });
    if (
      !progress.completedSubSections.some((s) => s.toString() === subSectionId)
    ) {
      progress.completedSubSections.push(subSectionId);
    }
    progress.lastAccessed = new Date();
    await progress.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Subsection marked as complete",
        data: progress,
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

exports.markSubSectionIncomplete = async (req, res) => {
  try {
    const { courseId, subSectionId } = req.body;
    const progress = await CourseProgress.findOne({
      user: req.user._id,
      course: courseId,
    });
    if (!progress)
      return res
        .status(404)
        .json({ success: false, message: "Progress record not found" });
    progress.completedSubSections = progress.completedSubSections.filter(
      (s) => s.toString() !== subSectionId,
    );
    await progress.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Subsection marked as incomplete",
        data: progress,
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

exports.getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user._id;
    const courses = await Course.find({ studentsEnrolled: userId })
      .populate("instructor", "firstName lastName")
      .populate("category", "name");
    const enrollments = await Promise.all(
      courses.map(async (course) => {
        const progress = await CourseProgress.findOne({
          user: userId,
          course: course._id,
        });
        return {
          course,
          progress: progress
            ? {
                completedSubSections: progress.completedSubSections.length,
                completionPercentage: progress.completionPercentage,
                lastAccessed: progress.lastAccessed,
                isCompleted: progress.isCompleted,
              }
            : {
                completedSubSections: 0,
                completionPercentage: 0,
                isCompleted: false,
              },
        };
      }),
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Enrolled courses fetched",
        data: enrollments,
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
