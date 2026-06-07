const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/zod.middleware');
const { sectionSchemas } = require('../validators');
const { createSection, updateSection, deleteSection } = require('../controllers/section.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken, authorizeRoles('instructor', 'admin'));
router.post('/', validate(sectionSchemas.create), createSection);
router.put('/:sectionId', validate(sectionSchemas.update), updateSection);
router.delete('/:sectionId', deleteSection);

module.exports = router;
