const User = require("../models/user.model");
const Profile = require("../models/profile.model");

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
        if (!profile) return res.status(404).json({ message: "Profile not found" });

       

        // Update profile fields
        if (phoneNumber !== undefined) profile.phoneNumber = phoneNumber;
        if (gender !== undefined) profile.gender = gender;
        if (age !== undefined) profile.age = age;

        // Optional: update avatar based on first + last name if provided
        if (firstName && lastName) {
            profile.avatar = `https://avatar.iran.liara.run/username?username=${firstName}+${lastName}`;

            // Also update user first/last name
            const user = await User.findById(req.user.id);
            user.firstName = firstName;
            user.lastName = lastName;
            await user.save();
        }

        await profile.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};