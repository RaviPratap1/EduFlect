const SubSection = require("../models/subSection.model");
const Section = require("../models/section.model");
const Course = require("../models/course.model");
const { uploadOnCloudinary } = require("../services/cloudinary.service");

const checkSectionOwnership = async (sectionId, userId, userRole) => {
  const section = await Section.findById(sectionId);
  if (!section) throw { status: 404, message: "Section not found" };
  const course = await Course.findById(section.course);
  if (!course) throw { status: 404, message: "Course not found" };
  if (
    userRole !== "admin" &&
    course.instructor.toString() !== userId.toString()
  ) {
    throw { status: 403, message: "Permission denied" };
  }
  return section;
};

exports.createSubSection = async (req, res) => {
  try {
    const { name, description, content, sectionId, duration, order } = req.body;
    const section = await checkSectionOwnership(
      sectionId,
      req.user._id,
      req.user.role,
    );
    let videoUrl = null,
      videoPublicId = null;
    if (req.file) {
      const uploaded = await uploadOnCloudinary(req.file.path);
      if (!uploaded)
        return res
          .status(500)
          .json({ success: false, message: "Video upload failed" });
      videoUrl = uploaded.secure_url;
      videoPublicId = uploaded.public_id;
    }
    const subSection = await SubSection.create({
      name,
      description,
      content,
      videoUrl,
      videoPublicId,
      section: sectionId,
      duration: Number(duration) || 0,
      order: Number(order) || 0,
    });
    section.subSections.push(subSection._id);
    await section.save();
    return res
      .status(201)
      .json({ success: true, message: "SubSection created", data: subSection });
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

exports.updateSubSection = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection)
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    await checkSectionOwnership(
      subSection.section,
      req.user._id,
      req.user.role,
    );
    const updated = await SubSection.findByIdAndUpdate(subSectionId, req.body, {
      new: true,
    });
    return res
      .status(200)
      .json({ success: true, message: "SubSection updated", data: updated });
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

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection)
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    await checkSectionOwnership(
      subSection.section,
      req.user._id,
      req.user.role,
    );
    await SubSection.findByIdAndDelete(subSectionId);
    await Section.findByIdAndUpdate(subSection.section, {
      $pull: { subSections: subSectionId },
    });
    return res
      .status(200)
      .json({ success: true, message: "SubSection deleted" });
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
