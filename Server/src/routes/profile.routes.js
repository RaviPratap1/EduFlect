const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/zod.middleware');
const { profileSchemas } = require('../validators');
const { getProfile, updateProfile, uploadAvatar, getAllUsers, deleteUser, updateUserRole } = require('../controllers/profile.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');

router.use(verifyToken);

router.get('/', getProfile);
router.put('/', validate(profileSchemas.updateProfile), updateProfile);
router.patch('/avatar', upload.single('avatar'), uploadAvatar);

// Admin routes
router.get('/admin/users', authorizeRoles('admin'), getAllUsers);
router.delete('/admin/users/:userId', authorizeRoles('admin'), deleteUser);
router.patch('/admin/users/:userId/role', authorizeRoles('admin'), validate(profileSchemas.updateUserRole), updateUserRole);

module.exports = router;
