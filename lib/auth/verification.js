import crypto from 'crypto';
import { sendOrderConfirmationEmail } from '../email/sendEmail';

const debugEnv = () => {
  console.log('Environment Variables Check:', {
    NODE_ENV: process.env.NODE_ENV,
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    GMAIL_USER: process.env.GMAIL_USER ? 'Set' : 'Not Set',
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not Set'
  });
};

const getBaseUrl = () => {
  console.log('Getting base URL:', {
    env: process.env.NODE_ENV,
    configuredUrl: process.env.NEXT_PUBLIC_BASE_URL
  });
  
  return process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.NODE_ENV === 'production'
      ? 'https://viva-pharmacy.vercel.app'
      : 'http://localhost:3000');
};

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (email, token) => {
  debugEnv();
  const baseUrl = getBaseUrl();
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  console.log('Sending verification email:', {
    to: email,
    verificationUrl
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #003366;">Welcome to Viva Pharmacy!</h1>
      <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #003366; 
                  color: white; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
      </div>
      <p style="color: #666;">Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
      <p style="color: #666;">This link will expire in 24 hours.</p>
    </div>
  `;

  try {
    await sendOrderConfirmationEmail(
      email,
      'Verify your Viva Pharmacy account',
      html
    );
    console.log('Verification email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};

export const verifyEmailToken = async (User, token) => {
  if (!token) {
    throw new Error('No verification token provided');
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return user;
};

export const resendVerificationEmail = async (User, email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    throw new Error('No account found with this email');
  }

  if (user.isVerified) {
    throw new Error('Email is already verified');
  }

  const verificationToken = generateVerificationToken();
  user.verificationToken = verificationToken;
  await user.save();

  await sendVerificationEmail(user.email, verificationToken);
  return true;
};
