const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
  // If SMTP config is present, use it; otherwise log to console
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    return info;
  }

  // Fallback: print reset link or message to server console
  console.log('=== sendEmail fallback ===');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('HTML:', html);
  console.log('==========================');

  return { message: 'Logged to console (no SMTP configured)' };
}

module.exports = sendEmail;
