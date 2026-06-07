const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        review: {
            type: String,
            trim: true
        }

    },
    { timestamps: true }
);



// One review per user per course
ratingAndReviewSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model(
    "RatingAndReview",
    ratingAndReviewSchema
);