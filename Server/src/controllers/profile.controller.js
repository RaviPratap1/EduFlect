const Profile = require("../models/profile.model");
const User = require("../models/user.model");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinary.service");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("profile");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res
      .status(200)
      .json({
        success: true,
        message: "Profile data",
        data: { user, profile: user.profile },
      });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { gender, phone, bio, firstName, lastName } = req.body;
    if (firstName || lastName) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      });
    }
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      {
        ...(gender && { gender }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
      },
      { new: true, runValidators: true },
    );
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    return res
      .status(200)
      .json({ success: true, message: "Profile updated", data: profile });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Image file required" });
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    if (profile.avatarPublicId)
      await deleteFromCloudinary(profile.avatarPublicId);
    const uploaded = await uploadOnCloudinary(req.file.path);
    if (!uploaded)
      return res
        .status(500)
        .json({
          success: false,
          message: "Image upload failed, please try again",
        });
    profile.avatar = uploaded.secure_url;
    profile.avatarPublicId = uploaded.public_id;
    await profile.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Avatar uploaded",
        data: { avatar: profile.avatar },
      });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate("profile")
        .select("-password -refreshToken")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    return res
      .status(200)
      .json({
        success: true,
        message: "Users fetched",
        data: {
          users,
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    await Profile.findOneAndDelete({ user: userId });
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!["student", "instructor", "admin"].includes(role))
      return res.status(400).json({ success: false, message: "Invalid role" });
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res
      .status(200)
      .json({ success: true, message: "User role updated", data: user });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};
