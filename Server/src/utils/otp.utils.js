const crypto = require('crypto');
const OTP = require('../models/otp.model');

// Generate a secure 6-digit OTP
exports.generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Save OTP with the provided type (email_verify or password_reset)
exports.saveOTP = async (email, otp, type = 'email_verify') => {
  // Remove any previous OTP of this type first
  await OTP.deleteOne({ email, type });

  await OTP.create({
    email,
    otp,
    type,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });
};

// Verify OTP and type match
exports.verifyOTP = async (email, otp, type = 'email_verify') => {
  const otpRecord = await OTP.findOne({ email, type });

  if (!otpRecord) {
    return { success: false, message: 'OTP has expired or type is invalid — please request a new one' };
  }

  if (otpRecord.otp !== otp) {
    return { success: false, message: 'Invalid OTP' };
  }

  // OTP is valid — delete it after use (one-time use)
  await OTP.deleteOne({ email, type });
  return { success: true };
};
