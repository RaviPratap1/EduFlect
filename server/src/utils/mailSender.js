const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    // transporter configuration
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // send mail
    const info = await transporter.sendMail({
      from: `"EduFlect" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    return info;
  } catch (error) {
    console.error("Error while sending mail:", error.message);
    throw error;
  }
};

module.exports = mailSender;