exports.otpTemplate = (name, otp) => ({
  subject: 'Your OTP Code - EduFlect',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1f2937;">Hello, ${name}! 👋</h2>
      <p style="color: #6b7280;">Your verification OTP code is:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="color: #4F46E5; letter-spacing: 10px; font-size: 36px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #6b7280;">This OTP will expire in <strong>10 minutes</strong>.</p>
      <p style="color: #9ca3af; font-size: 12px;">If you did not request this, please ignore this email.</p>
    </div>
  `,
});
