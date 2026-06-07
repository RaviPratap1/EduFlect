const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/zod.middleware');
const { categorySchemas } = require('../validators');
const { getAllCategories,getCategoryById, getCategoryWithCourses, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');

// Public
router.get('/', getAllCategories);
router.get('/:categoryId', getCategoryById);
router.get('/:categoryId/courses', getCategoryWithCourses);

// Admin only
router.post('/', verifyToken, authorizeRoles('admin'), validate(categorySchemas.create), createCategory);
router.put('/:categoryId', verifyToken, authorizeRoles('admin'), validate(categorySchemas.update), updateCategory);
router.delete('/:categoryId', verifyToken, authorizeRoles('admin'), deleteCategory);

module.exports = router;
