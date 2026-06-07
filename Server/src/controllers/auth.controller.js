const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Profile = require("../models/profile.model");
const { generateOTP, saveOTP, verifyOTP } = require("../utils/otp.utils");
const { sendOtpEmail, sendWelcomeEmail } = require("../services/email.service");

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "60m" },
  );

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// 1. REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    let user = existingUser;
    if (existingUser && !existingUser.isVerified) {
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.password = await bcrypt.hash(password, 10);
      existingUser.role = role || "student";
      await existingUser.save();
      const otp = generateOTP();
      await saveOTP(email, otp, "email_verify");
      await sendOtpEmail(email, existingUser.firstName, otp);
      return res
        .status(200)
        .json({
          success: true,
          message:
            "Existing unverified user found - OTP has been resent to your email",
        });
    }

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || "student",
      });
      const profile = await Profile.create({ user: user._id });
      user.profile = profile._id;
      await user.save();
    }

    const otp = generateOTP();
    await saveOTP(email, otp, "email_verify");
    await sendOtpEmail(email, user.firstName, otp);

    return res
      .status(201)
      .json({
        success: true,
        message:
          "OTP has been sent to your email - please verify within 10 minutes",
      });
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

// 2. VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.isVerified)
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });

    const result = await verifyOTP(email, otp, "email_verify");
    if (!result.success)
      return res.status(400).json({ success: false, message: result.message });

    user.isVerified = true;
    await user.save();
    await sendWelcomeEmail(email, user.firstName);

    return res
      .status(200)
      .json({
        success: true,
        message: "Email verified successfully! You can now login",
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

// 3. RESEND OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.isVerified)
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });

    const otp = generateOTP();
    await saveOTP(email, otp, "email_verify");
    await sendOtpEmail(email, user.firstName, otp);

    return res
      .status(200)
      .json({ success: true, message: "New OTP has been sent to your email" });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

// 4. LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select(
      "+password +refreshToken",
    );
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Email or password is incorrect" });
    if (!user.isVerified)
      return res
        .status(403)
        .json({ success: false, message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Email or password is incorrect" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user: {
          _id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
        },
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

// 5. REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token)
      return res
        .status(401)
        .json({
          success: false,
          message: "Refresh token not found - please login again",
        });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Invalid refresh token - please login again",
        });
    }

    const accessToken = generateAccessToken(user);
    return res
      .status(200)
      .json({
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken },
      });
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

// 6. LOGOUT
exports.logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+refreshToken");
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.clearCookie("refreshToken");
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};

// 7. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const otp = generateOTP();
      await saveOTP(email, otp, "password_reset");
      await sendOtpEmail(email, user.firstName, otp);
    }
    return res
      .status(200)
      .json({
        success: true,
        message: "If the email is registered, password reset OTP has been sent",
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

// 8. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const result = await verifyOTP(email, otp, "password_reset");
    if (!result.success)
      return res.status(400).json({ success: false, message: result.message });

    user.password = await bcrypt.hash(newPassword, 12);
    user.refreshToken = null;
    await user.save();
    res.clearCookie("refreshToken");

    return res
      .status(200)
      .json({
        success: true,
        message: "Password reset successfully! You can now login",
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

// 9. CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select(
      "+password +refreshToken",
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame)
      return res
        .status(400)
        .json({
          success: false,
          message: "New password must be different from old password",
        });

    user.password = await bcrypt.hash(newPassword, 12);
    user.refreshToken = null;
    await user.save();
    res.clearCookie("refreshToken");

    return res
      .status(200)
      .json({
        success: true,
        message: "Password changed successfully! Please login again",
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


// 10. GET ME
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("profile");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res
      .status(200)
      .json({ success: true, message: "User data", data: user });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};
