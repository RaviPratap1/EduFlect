// const User = require("../models/user.model");
// const Profile = require("../models/profile.model");
// const Otp = require("../models/otp.model");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const mailSender = require("../utils/mailSender");

// // 🔹 Internal helper: Send OTP
// const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// const sendOtp = async (email) => {
//   // 1️⃣ Find user
//   const user = await User.findOne({ email });
//   if (!user) throw new Error("User not found");

//   // 2️⃣ Only unverified users
//   if (user.isVerified) throw new Error("User already verified");

//   // 3️⃣ Generate OTP
//   const otpCode = generateOtp();

//   // 4️⃣ Save OTP (overwrite if exists)
//   await Otp.findOneAndUpdate(
//     { email },
//     { otp: otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, // 5 min TTL
//     { upsert: true }
//   );

//   // 5️⃣ Send email
//   await mailSender(
//     user.email,
//     "Your EduFlect OTP",
//     `<p>Hello ${user.firstName},</p>
//      <p>Your OTP is <strong>${otpCode}</strong>. It will expire in 5 minutes.</p>`
//   );

//   return otpCode;
// };


// // 🔹 Signup Controller
// exports.signup = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password, phoneNumber, gender, age } = req.body;

//     // 1️⃣ Check if user exists
//     let existingUser = await User.findOne({ email }).populate("profile");

//     // 2️⃣ User exists and verified → error
//     if (existingUser && existingUser.isVerified) {
//       return res.status(400).json({ message: "User already exists and verified" });
//     }

//     // 3️⃣ Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     if (existingUser && !existingUser.isVerified) {
//       // 4️⃣ Existing unverified user → update user & profile
//       existingUser.firstName = firstName;
//       existingUser.lastName = lastName;
//       existingUser.password = hashedPassword;

//       // Update profile
//       if (existingUser.profile) {
//         existingUser.profile.phoneNumber = phoneNumber;
//         existingUser.profile.gender = gender;
//         existingUser.profile.age = age;
//         existingUser.profile.avatar = `https://avatar.iran.liara.run/username?username=${firstName}+${lastName}`;
//         await existingUser.profile.save();
//       } else {
//         // If somehow profile missing, create new
//         const profile = await Profile.create({
//           user: existingUser._id,
//           phoneNumber,
//           gender,
//           age,
//           avatar: `https://avatar.iran.liara.run/username?username=${firstName}+${lastName}`,
//         });
//         existingUser.profile = profile._id;
//       }

//       await existingUser.save();

//       // 5️⃣ Send new OTP
//       await sendOtp(email);

//       return res.status(200).json({
//         success: true,
//         message: "Existing unverified user updated. OTP resent to your email.",
//       });
//     }

//     // 6️⃣ If user does not exist → normal signup flow
//     const user = await User.create({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       role: "student", // default role
//     });

//     // Create profile with auto-avatar
//     const profile = await Profile.create({
//       user: user._id,
//       phoneNumber,
//       gender,
//       age,
//       avatar: `https://avatar.iran.liara.run/username?username=${firstName}+${lastName}`,
//     });

//     user.profile = profile._id;
//     await user.save();

//     // Send OTP
//     await sendOtp(email);

//     res.status(201).json({
//       success: true,
//       message: "Signup successful. OTP sent to your email.",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // 🔹 Verify OTP Controller
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     // 1️⃣ Find OTP record
//     const otpRecord = await Otp.findOne({ email, otp });
//     if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });

//     // 2️⃣ Check expiry
//     if (otpRecord.expiresAt < new Date()) {
//       await Otp.deleteOne({ _id: otpRecord._id });
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     // 3️⃣ Delete OTP after success
//     await Otp.deleteOne({ _id: otpRecord._id });

//     // 4️⃣ Update user isVerified
//     const user = await User.findOne({ email }).populate("profile");
//     user.isVerified = true;
//     await user.save();

//     // 5️⃣ Generate JWT
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({
//       success: true,
//       message: "OTP verified successfully",
//       token,
//       user,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // 🔹 Resend OTP Controller
// exports.resendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     await sendOtp(email);

//     res.status(200).json({
//       success: true,
//       message: "OTP resent successfully",
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };



// // 🔹 Forgot / Reset Password Controller
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // 1️⃣ Find user
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // 2️⃣ Only verified users can reset password
//     if (!user.isVerified)
//       return res
//         .status(400)
//         .json({ message: "Please verify your account first" });

//     // 3️⃣ Generate OTP
//     const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

//     // 4️⃣ Save OTP (overwrite if exists) with 10 min TTL
//     await Otp.findOneAndUpdate(
//       { email },
//       { otp: otpCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
//       { upsert: true }
//     );

//     // 5️⃣ Send OTP email
//     await mailSender(
//       user.email,
//       "EduFlect Password Reset OTP",
//       `<p>Hello ${user.firstName},</p>
//        <p>Your password reset OTP is <strong>${otpCode}</strong>. It will expire in 10 minutes.</p>`
//     );

//     res.status(200).json({
//       success: true,
//       message: "Password reset OTP sent to your email",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     // 1️⃣ Find OTP record
//     const otpRecord = await Otp.findOne({ email, otp });
//     if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });

//     // 2️⃣ Check expiry
//     if (otpRecord.expiresAt < new Date()) {
//       await Otp.deleteOne({ _id: otpRecord._id });
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     // 3️⃣ Delete OTP after success
//     await Otp.deleteOne({ _id: otpRecord._id });

//     // 4️⃣ Update user password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     const user = await User.findOne({ email });
//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Password reset successful. You can now login with new password.",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




const User = require("../models/user.model");
const Profile = require("../models/profile.model");
const Otp = require("../models/otp.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const { log } = require("console");

// -------------------------------
// Helpers
// -------------------------------

/**
 * Generate secure 6-digit OTP
 */
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

/**
 * Send OTP (verification or reset)
 * Returns generic success message for security
 */
const sendOtp = async (email, purpose = "verification") => {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    // Security: never reveal if email exists
    if (!user) {
        // Fake delay to prevent timing attacks
        await new Promise(r => setTimeout(r, 600 + Math.random() * 600));
        return { success: true };
    }

    if (purpose === "verification" && user.isVerified) {
        return { success: false, message: "Account already verified" };
    }

    if (purpose === "reset" && !user.isVerified) {
        return { success: false, message: "Account not verified" };
    }

    const otp = generateOtp();

    await Otp.findOneAndUpdate(
        { email: normalizedEmail },
        { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
        { upsert: true }
    );

    const subject = purpose === "reset"
        ? "EduFlect - Reset Password OTP"
        : "EduFlect - Verification OTP";

    const html = `
    <p>Hello ${user.firstName || "there"},</p>
    <p>Your OTP: <strong>${otp}</strong></p>
    <p>Valid for 10 minutes.</p>
    <p>Ignore if you didn't request this.</p>
    <p>EduFlect Team</p>
  `;

    await mailSender(normalizedEmail, subject, html);

    return { success: true };
};

// -------------------------------
// Controllers
// -------------------------------

exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, role = "student" } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: "Email, password, and confirm password required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        let user = await User.findOne({ email: normalizedEmail });

        if (user && user.isVerified) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const avatar = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
            `${firstName || ""} ${lastName || ""}`.trim() || "user"
        )}`;

        if (user) {
            // Update unverified user
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.password = hashedPassword;
            user.role = role || user.role;

            if (user.profile) {
                const profile = await Profile.findById(user.profile);
                profile.phoneNumber = phoneNumber || profile.phoneNumber;
                profile.gender = gender || profile.gender;
                profile.age = age || profile.age;
                profile.avatar = avatar;
                await profile.save();
            } else {
                const profile = await Profile.create({
                    user: user._id,
                    phoneNumber,
                    gender,
                    age,
                    avatar,
                });
                user.profile = profile._id;
            }
            await user.save();
        } else {
            // New user
            user = await User.create({
                firstName,
                lastName,
                email: normalizedEmail,
                password: hashedPassword,
                role: role,
            });

            const profile = await Profile.create({
                user: user._id,
                phoneNumber,
                gender,
                age,
                avatar,
            });

            user.profile = profile._id;
            await user.save();
        }

        await sendOtp(normalizedEmail, "verification");

        return res.status(201).json({
            success: true,
            message: "OTP sent to your email",
        });
    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otpDoc = await Otp.findOne({ email: normalizedEmail, otp });

        if (!otpDoc) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (otpDoc.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otpDoc._id });
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        await Otp.deleteOne({ _id: otpDoc._id });

        const user = await User.findOne({ email: normalizedEmail }).populate("profile");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isVerified = true;
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Verified successfully",
            token,
            user,
        });
    } catch (err) {
        console.error("Verify error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email required" });
        }

        const result = await sendOtp(email, "verification");

        return res.status(result.success ? 200 : 400).json({
            success: result.success,
            message: result.message || "OTP resent",
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email required" });
        }

        const result = await sendOtp(email, "reset");

        return res.status(result.success ? 200 : 400).json({
            success: result.success,
            message: result.message || "If account exists, reset OTP sent",
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otpDoc = await Otp.findOne({ email: normalizedEmail, otp });

        if (!otpDoc) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (otpDoc.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otpDoc._id });
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        await Otp.deleteOne({ _id: otpDoc._id });

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    } catch (err) {
        console.error("Reset error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Input validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    // Get current user from middleware (req.user)
    // We need password field → override select: false if present
    const user = await User.findById(req.user.id)
      .select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    
   

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};



exports.login = async (req, res) => {
    try {
        // Log incoming request body (remove in production or use conditional logging)
        console.log("Login attempt body:", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user and explicitly include password (overrides select: false in schema)
        const user = await User.findOne({ email: normalizedEmail })
            .select("+password")       // Important: loads the password field
            .populate("profile");



        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first",
            });
        }

        if (!user.password) {
            console.error("CRITICAL: User has no password field!");
            return res.status(500).json({
                success: false,
                message: "Account configuration error",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        console.log("Password comparison result:", isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // 7 days expiry – adjust as needed
        );

        // Prepare safe user data for response (never send password or sensitive fields)
        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profile: user.profile
                ? {
                    phoneNumber: user.profile.phoneNumber,
                    gender: user.profile.gender,
                    age: user.profile.age,
                    avatar: user.profile.avatar,
                }
                : null,
        };

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userResponse,
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
        });
    }
};



/*
  Important production notes:

  1. Add rate limiting (express-rate-limit or similar)
     - /signup, /resendOtp, /forgotPassword → ~5 req / 10 min per IP/email
     - /verifyOtp, /resetPassword     → ~10 attempts / 5 min per email

  2. Add basic input validation (zod / joi / express-validator)

  3. Store JWT_SECRET in .env

  4. Use HTTPS in production

  5. Consider adding login with password endpoint if needed
*/