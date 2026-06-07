const Section = require("../models/section.model");
const Course = require("../models/course.model");

const checkCourseOwnership = async (courseId, userId, userRole) => {
  const course = await Course.findById(courseId);
  if (!course) throw { status: 404, message: "Course not found" };
  if (
    userRole !== "admin" &&
    course.instructor.toString() !== userId.toString()
  ) {
    throw {
      status: 403,
      message: "You don't have permission to modify this course",
    };
  }
  return course;
};

exports.createSection = async (req, res) => {
  try {
    const { name, description, courseId, order } = req.body;
    const course = await checkCourseOwnership(
      courseId,
      req.user._id,
      req.user.role,
    );
    const section = await Section.create({
      name,
      description,
      course: courseId,
      order: Number(order) || 0,
    });
    course.sections.push(section._id);
    await course.save();
    return res
      .status(201)
      .json({ success: true, message: "Section created", data: section });
  } catch (err) {
    const status = err.status || 500;
    return res
      .status(status)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const section = await Section.findById(sectionId);
    if (!section)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    await checkCourseOwnership(section.course, req.user._id, req.user.role);
    const { name, description, order } = req.body;
    const updated = await Section.findByIdAndUpdate(
      sectionId,
      { name, description, ...(order !== undefined && { order }) },
      { new: true },
    );
    return res
      .status(200)
      .json({ success: true, message: "Section updated", data: updated });
  } catch (err) {
    const status = err.status || 500;
    return res
      .status(status)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const section = await Section.findById(sectionId);
    if (!section)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    await checkCourseOwnership(section.course, req.user._id, req.user.role);
    await Section.findByIdAndDelete(sectionId);
    await Course.findByIdAndUpdate(section.course, {
      $pull: { sections: sectionId },
    });
    return res.status(200).json({ success: true, message: "Section deleted" });
  } catch (err) {
    const status = err.status || 500;
    return res
      .status(status)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};
