const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/zod.middleware');
const { courseSchemas } = require('../validators');
const { getAllCourses, getCourse, createCourse, updateCourse, deleteCourse, togglePublish, getInstructorCourses, adminGetAllCourses } = require('../controllers/course.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');

// Public
router.get('/', getAllCourses);
router.get('/:courseId', validate(courseSchemas.courseIdParam), getCourse);

// Instructor
router.get('/instructor/my-courses', verifyToken, authorizeRoles('instructor', 'admin'), getInstructorCourses);
router.post('/', verifyToken, authorizeRoles('instructor', 'admin'), upload.single('thumbnail'), validate(courseSchemas.create), createCourse);
router.put('/:courseId', verifyToken, authorizeRoles('instructor', 'admin'), upload.single('thumbnail'), validate(courseSchemas.update), updateCourse);
router.delete('/:courseId', verifyToken, authorizeRoles('instructor', 'admin'), deleteCourse);
router.patch('/:courseId/toggle-publish', verifyToken, authorizeRoles('instructor', 'admin'), togglePublish);

// Admin
router.get('/admin/all', verifyToken, authorizeRoles('admin'), adminGetAllCourses);

module.exports = router;
