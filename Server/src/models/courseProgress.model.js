const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    completedSubSections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection",
      },
    ],

    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    lastAccessed: {
      type: Date,
      default: Date.now,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate course progress records
courseProgressSchema.index(
  {
    user: 1,
    course: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("CourseProgress", courseProgressSchema);