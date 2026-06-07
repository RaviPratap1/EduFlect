const resend = require('../config/email.config');
const { welcomeTemplate } = require('../templates/emails/welcome.template');
const { otpTemplate } = require('../templates/emails/otp.template');
const { resetPasswordTemplate } = require('../templates/emails/resetPassword.template');

const sendEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: 'EduFlect <noreply@eduflect.online>',
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

exports.sendWelcomeEmail = async (email, name) => {
  const template = welcomeTemplate(name);
  return await sendEmail({ to: email, ...template });
};

exports.sendOtpEmail = async (email, name, otp) => {
  const template = otpTemplate(name, otp);
  return await sendEmail({ to: email, ...template });
};

exports.sendResetPasswordEmail = async (email, name, resetLink) => {
  const template = resetPasswordTemplate(name, resetLink);
  return await sendEmail({ to: email, ...template });
};