const SubSection = require("../models/subSectionModel");
const Section = require("../models/sectionModel");
const { uploadToCloudinary } = require("../utils/cloudinaryUploader");

exports.createSubSection = async (req, res) => {
  try {
    const { title, description, isFreePreview, sectionId } = req.body;

    if (!title || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Title and sectionId are required",
      });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Upload video if provided
    let videoData = {};
    if (req.files && req.files.video) {
      const uploadDetails = await uploadToCloudinary(
        req.files.video,
        "subsectionVideos",
        null,
        null,
        null,
        "video"
      );

      // console.log("uploadDetails", uploadDetails);
      

      videoData.videoUrl = uploadDetails.secure_url;
      videoData.videoDuration = uploadDetails.duration;
    }

    const subSection = await SubSection.create({
      title,
      description,
      isFreePreview,
      ...videoData,
    });

    section.subSection.push(subSection._id);
    await section.save();

    res.status(201).json({
      success: true,
      message: "SubSection created successfully",
      subSection,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getSubSection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "SubSection id is required",
      });
    }

    const subSection = await SubSection.findById(id);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "SubSection fetched successfully",
      subSection,
    });

  } catch (error) {
    console.error("Get SubSection Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { id } = req.params;

    const subSection = await SubSection.findById(id);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "isFreePreview",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        subSection[field] = req.body[field];
      }
    });

    // Update video if new one provided
    if (req.files && req.files.video) {
      const uploadDetails = await uploadToCloudinary(
        req.files.video,
        "subsectionVideos",
        null,
        null,
        null,
        "video"
      );

      subSection.videoUrl = uploadDetails.secure_url;
      subSection.videoDuration = uploadDetails.duration;
    }

    await subSection.save();

    res.status(200).json({
      success: true,
      message: "SubSection updated successfully",
      subSection,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.deleteSubSection = async (req, res) => {
  try {
    const { id } = req.params;

    const subSection = await SubSection.findById(id);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    // Remove from section
    await Section.updateMany(
      { subSection: id },
      { $pull: { subSection: id } }
    );

    await SubSection.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "SubSection deleted successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};