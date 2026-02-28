const express = require("express");
const router = express.Router();

const {getProfile, updateProfile} = require("../controllers/profileController");
const {authMiddleware} = require("../middleware/auth.middleware");


// ✅ Get Profile route (Protected)
router.get("/get-profile", authMiddleware, getProfile);

// ✅ Update Profile route (Protected)
router.put("/update-profile", authMiddleware, updateProfile);


module.exports = router;        