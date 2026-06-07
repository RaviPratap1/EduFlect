const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [15, "Phone number too long"],
    },
    avatar: {
      type: String,
      default: null
    },
    avatarPublicId: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [300, "Bio too long"],
      default: ""
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Profile", profileSchema);
