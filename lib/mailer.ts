import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] SMTP_USER or SMTP_PASS not set — skipping email.');
    return null;
  }

  const info = await transporter.sendMail({
    from: `"${process.env.APP_NAME || 'Grievance Portal'}" <${process.env.SMTP_USER}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  });

  console.log('[Mailer] Message sent:', info.messageId);
  return info;
}
