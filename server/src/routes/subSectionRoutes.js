const express = require("express");
const router = express.Router();
const subController = require("../controllers/subSectionController");
const { authMiddleware, instructorMiddleware } = require("../middleware/auth.middleware");

// Public
router.get("/:id", subController.getSubSection);

// Protected (instructor)
router.post("/", authMiddleware, instructorMiddleware, subController.createSubSection);
router.put("/:id", authMiddleware, instructorMiddleware, subController.updateSubSection);
router.delete("/:id", authMiddleware, instructorMiddleware, subController.deleteSubSection);

module.exports = router;
