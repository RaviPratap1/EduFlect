exports.resetPasswordTemplate = (name, resetLink) => ({
  subject: 'Password Reset - EduFlect',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1f2937;">Password Reset Request</h2>
      <p style="color: #6b7280;">Hello ${name}, you requested a password reset.</p>
      <a href="${resetLink}"
         style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px;
                border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0;">
        Reset Your Password
      </a>
      <p style="color: #6b7280;">This link will expire in <strong>15 minutes</strong>.</p>
      <p style="color: #9ca3af; font-size: 12px;">If you did not request this, please ignore this email. Your account is safe.</p>
    </div>
  `,
});
