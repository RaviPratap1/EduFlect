const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/sectionController");
const { authMiddleware, instructorMiddleware } = require("../middleware/auth.middleware");

// Public
router.get("/:id", sectionController.getSection);

// Protected (instructor or admin via controller checks)
router.post("/", authMiddleware, instructorMiddleware, sectionController.createSection);
router.put("/:id", authMiddleware, sectionController.updateSection);
router.delete("/:id", authMiddleware, sectionController.deleteSection);

module.exports = router;
