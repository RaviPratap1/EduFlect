
const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const Profile = require("../models/profile.model");

/* =====================================================
   Helper: Generate OTP
===================================================== */
const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

/* =====================================================
   Helper: Send OTP
===================================================== */
const sendOtp = async (email, purpose = "verify") => {
  try {
    if (!email) {
      return { success: false, message: "Email is required" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Optional security check (don't reveal if email exists)
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return { success: true };
    }

    const otp = generateOtp();

    // Save or Update OTP
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
      { upsert: true, returnDocument: "after" }
    );

    const subject =
      purpose === "reset"
        ? "Reset Password OTP"
        : "Account Verification OTP";

    const html = `
      <h2>Your OTP: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    `;

    // Send Email
    await mailSender(normalizedEmail, subject, html);

    return { success: true };
  } catch (error) {
    console.error("OTP Send Error:", error.message);

    return {
      success: false,
      message: "Failed to send OTP. Please try again.",
    };
  }
};


/* =====================================================
   SIGNUP
===================================================== */






exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role = "student",
    } = req.body;

    if (!firstName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    if (existingUser) {
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.password = hashedPassword;
      existingUser.role = role;
      user = await existingUser.save();
    } else {
      user = await User.create({
        firstName,
        lastName,
        email: normalizedEmail,
        password: hashedPassword,
        role,
      });
    }

    const avatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}`

    // ✅ STEP 2: Create Profile AFTER User
    const profile = await Profile.create({
      user: user._id,
      phoneNumber: "",
      avatar,
      gender: "other",
      age: null,
    });

    // ✅ STEP 3: Link profile to user
    user.profile = profile._id;
    await user.save();

    await sendOtp(normalizedEmail, "verify");

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email",
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



/* =====================================================
   VERIFY OTP
===================================================== */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find OTP
    const otpDoc = await Otp.findOne({ email: normalizedEmail });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Expiry check
    if (otpDoc.expiresAt.getTime() < Date.now()) {        //*********** */
      await Otp.deleteOne({ email: normalizedEmail });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // OTP match check
    if (otpDoc.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Delete OTP after successful match
    await Otp.deleteOne({ email: normalizedEmail });

    // Find user
    const user = await User.findOne({ email: normalizedEmail })
      .populate("profile")


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Mark verified
    user.isVerified = true;
    await user.save();

    console.log("user in otp verify", user);
    console.log("user profile in otp verify", user.profile);


    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        profile: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
      token,
      role: user.role,
      profile: user.profile
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in verify otp",
    });
  }
};

/* =====================================================
   RESEND OTP
===================================================== */
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    await sendOtp(email, "verify");

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   LOGIN
===================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail })
      .select("+password");


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "user not Verified",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
         profile: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      role: user.role,
      profile: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }

    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   FORGOT PASSWORD
===================================================== */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    await sendOtp(email, "reset");

    return res.status(200).json({
      success: true,
      message: "If account exists, reset OTP sent",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   RESET PASSWORD
===================================================== */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpDoc = await Otp.findOne({ email: normalizedEmail, otp });

    if (!otpDoc || otpDoc.expiresAt < new Date()) {   //*****************//
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await Otp.deleteOne({ _id: otpDoc._id });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   CHANGE PASSWORD (Logged In User)
===================================================== */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    console.log("password change", newPassword);

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and new password required",
      });
    }

    const user = await User.findById(req.user.id)
      .select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("password change", user);

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    console.log("password change", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log("password change");


    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};