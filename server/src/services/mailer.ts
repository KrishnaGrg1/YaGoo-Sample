import nodemailer from 'nodemailer';
import env from '../Ienv';

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
});

/**
 * Generate a 6-digit numeric OTP token.
 */
function generateToken(): string {
  return (100000 + Math.floor(Math.random() * 900000)).toString();
}

/**
 * Generic function to send an email.
 * @param to Recipient's email
 * @param subject Email subject
 * @param html HTML version of the email
 * @param text Plain text version of the email
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: `"YaGOo" <${env.SMTP_USERNAME}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Email service failure');
  }
}

// 📩 OTP Email: Email Verification During Registration
export async function sendRegistrationOtp(userEmail: string): Promise<string> {
  const token = generateToken();
  const subject = 'Verify Your Email - YaGOo Registration';
  const text = `Welcome to YaGOo! Use the following OTP to verify your email address: ${token}`;
  const html = `
    <p>Dear User,</p>
    <p>Welcome to <strong>YaGOo</strong>! Please verify your email address to complete your registration:</p>
    <p><b style="font-size: 20px;">${token}</b></p>
    <p>This OTP is valid for a limited time. Do not share it with anyone.</p>
    <p>Thanks for joining us!<br />— The YaGOo Team</p>`;

  await sendEmail(userEmail, subject, html, text);
  return token;
}


// 📩 OTP Email: Password Recovery
export async function sendRecoveryEmail(userEmail: string): Promise<string> {
  const token = generateToken();
  const subject = 'Password Recovery - Verify Your Email';
  const text = `Hello, use the token to verify your email: ${token}`;
  const html = `
    <p>Dear User,</p>
    <p>Please use the following token to verify your email address:</p>
    <p><b style="font-size: 20px;">${token}</b></p>
    <p>Do not share this token with anyone.</p>
    <p>Thank you,<br />The YaGOo Team</p>`;

  await sendEmail(userEmail, subject, html, text);
  return token;
}

// 📩 OTP Email: Ride Verification
export async function sendRideOtp(userEmail: string): Promise<string> {
  const token = generateToken();
  const subject = 'Ride OTP - Verify Your Ride';
  const text = `Hello, use the following OTP to verify your ride: ${token}`;
  const html = `
    <p>Dear Rider,</p>
    <p>You are about to embark on your ride. Please use the OTP below to confirm your ride:</p>
    <p><b style="font-size: 20px;">${token}</b></p>
    <p>Do not share this OTP with anyone.</p>
    <p>Thank you for choosing YaGOo!<br />The YaGOo Team</p>`;

  await sendEmail(userEmail, subject, html, text);
  return token;
}
