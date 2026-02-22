const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },

        role: {
            type: String,
            enum: ["student", "instructor", "admin"],
            default: "student",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },

        profile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);