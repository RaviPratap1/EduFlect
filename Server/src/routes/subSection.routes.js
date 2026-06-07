const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/zod.middleware');
const { subSectionSchemas } = require('../validators');
const { createSubSection, updateSubSection, deleteSubSection } = require('../controllers/subSection.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const {upload} = require('../middlewares/multer.middleware');

router.use(verifyToken, authorizeRoles('instructor', 'admin'));
router.post('/', upload.single('video'), validate(subSectionSchemas.create), createSubSection);
router.put('/:subSectionId', upload.single('video'), validate(subSectionSchemas.update), updateSubSection);
router.delete('/:subSectionId', upload.single('video'), deleteSubSection);

module.exports = router;
