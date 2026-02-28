const Section = require("../models/sectionModel");
const Course = require("../models/courseModel");

exports.createSection = async (req, res) => {
  try {
    const { sectionName, course: courseId } = req.body;
    if (!sectionName || !courseId) return res.status(400).json({ message: "sectionName and course are required" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // only instructor of course or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const section = await Section.create({ sectionName, course: courseId });
    course.courseContent.push(section._id);
    await course.save();

    res.status(201).json({ success: true, section });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id).populate("subSection");
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.status(200).json({ success: true, section });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const course = await Course.findById(section.course);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    Object.assign(section, req.body);
    await section.save();
    res.status(200).json({ success: true, section });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const course = await Course.findById(section.course);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // remove from course
    course.courseContent = course.courseContent.filter((s) => s.toString() !== id.toString());
    await course.save();

    await Section.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Section deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
