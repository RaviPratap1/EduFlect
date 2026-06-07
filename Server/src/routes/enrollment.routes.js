const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/zod.middleware');
const { enrollmentSchemas } = require('../validators');
const { getCourseProgress, markSubSectionComplete, markSubSectionIncomplete, getMyEnrollments } = require('../controllers/enrollment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/my-courses', getMyEnrollments);
router.get('/progress/:courseId', getCourseProgress);
router.post('/progress/complete', validate(enrollmentSchemas.progressAction), markSubSectionComplete);
router.post('/progress/incomplete', validate(enrollmentSchemas.progressAction), markSubSectionIncomplete);

module.exports = router;
