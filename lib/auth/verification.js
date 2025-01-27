import crypto from 'crypto';
import { sendVerificationEmail as sendEmail } from '@/lib/email/sendEmail';

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

export function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

export async function sendVerificationEmail(email, token) {
    try {
        console.log('🔄 Verification flow started for:', email);
        const verificationUrl = `${getBaseUrl()}/?verification=success`;
        const result = await sendEmail(email, token, verificationUrl);
        console.log('✅ Verification email sent:', result.messageId);
        return result;
    } catch (error) {
        console.error('❌ Failed to send verification email:', error);
        throw error;
    }
}

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
