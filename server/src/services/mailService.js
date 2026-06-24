import nodemailer from "nodemailer";

const getTransport = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });

export const sendOtpEmail = async ({ to, name, otp }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@trrrip.local";
  const subject = "Your Trrip verification code";
  const text = [
    `Hi ${name || "there"},`,
    "",
    `Your verification code is: ${otp}`,
    "",
    "This code expires in 10 minutes.",
  ].join("\n");

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[mail] OTP for ${to}: ${otp}`);
    return;
  }

  const transport = getTransport();
  await transport.sendMail({ from, to, subject, text });
};
