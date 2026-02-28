const User = require("../models/user.model");
const Profile = require("../models/profile.model");
const { uploadToCloudinary } = require("../utils/cloudinaryUploader");

// 🔹 Get Profile
exports.getProfile = async (req, res) => {
    try {
        // assume req.user.id is populated by auth middleware
        const profile = await Profile.findOne({ user: req.user.id }).populate("user", "firstName lastName email role",)

        if (!profile) return res.status(404).json({ message: "Profile not found" });

        res.status(200).json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🔹 Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, gender, age } = req.body;

        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile)
            return res.status(404).json({ message: "Profile not found" });


        // 🔹 Update profile fields
        if (phoneNumber !== undefined) profile.phoneNumber = phoneNumber;
        if (gender !== undefined) profile.gender = gender;
        if (age !== undefined) profile.age = age;

        // 🔥 SAFE AVATAR UPLOAD
        if (req.files && req.files.avatar) {
            const result = await uploadToCloudinary(
                req.files.avatar,
                "avatars",
                200,
                200,
                "auto:good",
                "image"
            );

            profile.avatar = result.secure_url;
            profile.avatarPublicId = result.public_id;  //*********** */
        }

        // 🔹 Update first & last name
        if (firstName || lastName) {
            const user = await User.findById(req.user.id);

            if (firstName) user.firstName = firstName;
            if (lastName) user.lastName = lastName;

           

            await user.save();

            // 🔹 Auto avatar fallback only if NO image uploaded
            if (!(req.files && req.files.avatar) && firstName && lastName) {
                profile.avatar = `https://avatar.iran.liara.run/username?username=${firstName}+${lastName}`;
            }
        }

        await profile.save();
        console.log("Profile", profile);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile,


        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

