exports.welcomeTemplate = (name) => ({
  subject: 'Welcome to EduFlect! 🎉',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1f2937;">Hello, ${name}! 👋</h2>
      <p style="color: #6b7280;">Welcome to EduFlect. Your account has been successfully verified.</p>
      <p style="color: #6b7280;">You can now start your learning journey.</p>
      <a href="${process.env.CLIENT_URL}/login"
         style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px;
                border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">
        Login Now
      </a>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">EduFlect Team</p>
    </div>
  `,
});
