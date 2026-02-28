const express = require("express");
const router = express.Router();
const { authMiddleware, instructorMiddleware, studentMiddleware } = require("../middleware/auth.middleware");


const {createRatingAndReview,getAverageRating }   =  require("../controllers/ratingAndReviewController.js")


router.post("/", authMiddleware, studentMiddleware, createRatingAndReview);
router.get("/:id", authMiddleware, getAverageRating);

module.exports = router;