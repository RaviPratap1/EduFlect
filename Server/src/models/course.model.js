const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    thumbnail: {
      type: String,
      trim: true,
    },

    thumbnailPublicId: {
      type: String,
      default: null,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
      },
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    ratingAndReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview",
      },
    ],

    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isPublished: {
      type: Boolean,
      default: false,
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    language: {
      type: String,
      enum: ["Hindi/English", "English", "Hindi"],
      default: "Hindi/English",
    },

    totalDuration: {
      type: Number,
      default: 0, // minutes
    },

    whatYouWillLearn: [
      {
        type: String,
      },
    ],

    requirements: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual: Average Rating
courseSchema.virtual("averageRating").get(function () {
  return this._averageRating || 0;
});

// Virtual: Effective Price
courseSchema.virtual("effectivePrice").get(function () {
  return this.discount > 0
    ? Math.round(
        this.price - (this.price * this.discount) / 100
      )
    : this.price;
});

courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Course", courseSchema);