const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { authMiddleware, instructorMiddleware, adminMiddleware, studentMiddleware } = require("../middleware/auth.middleware");

// Public
router.get("/", courseController.getCourses);
router.get("/:id", courseController.getCourse);

// Protected (instructor) - create course
router.post("/", authMiddleware, instructorMiddleware, courseController.createCourse);

// Update/delete (instructor who owns or admin)
router.put("/:id", authMiddleware, courseController.updateCourse);
router.delete("/:id", authMiddleware, courseController.deleteCourse);

// Enroll (student)
router.post("/:id/enroll", authMiddleware, studentMiddleware, courseController.enrollCourse);

module.exports = router;
