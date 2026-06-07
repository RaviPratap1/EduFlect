const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/zod.middleware');
const { ratingSchemas } = require('../validators');
const { createRating, getCourseReviews, deleteReview, getAllReviews } = require('../controllers/ratingAndReview.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/top', getAllReviews); // public - homepage
router.get('/course/:courseId', getCourseReviews); // public
router.post('/', verifyToken, validate(ratingSchemas.createRating), createRating);
router.delete('/:reviewId', verifyToken, deleteReview);

module.exports = router;
