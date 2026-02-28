const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
    },

    videoUrl: {
      type: String, // Cloudinary video URL
      required: true,
    },

    videoDuration: {
      type: String, // "10:35"
      required: true,
    },

    isFreePreview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubSection", subSectionSchema);
