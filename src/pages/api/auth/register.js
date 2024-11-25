// src/pages/api/auth/register.js
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { sendVerificationEmail } from '../../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting registration process...');
    await dbConnect();
    
    const { email, password, phoneNumber } = req.body;
    console.log('Registering email:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save hook
      phoneNumber,
      isVerified: false
    });

    // Clear any existing verification tokens for this email
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    console.log('Generated verification token');

    // Save the user
    await user.save();
    console.log('User created successfully:', user.email);

    // Send verification email
    try {
      console.log('Attempting to send verification email...');
      
      // Always use the main production URL
      const baseUrl = 'https://viva-pharmacy.vercel.app';
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
      
      // Log email configuration
      console.log('Email configuration:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.GMAIL_USER,
        from: process.env.EMAIL_FROM,
        verificationUrl: verificationUrl
      });

      await sendVerificationEmail(user.email, verificationUrl);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      console.error('Detailed email error:', {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
        stack: emailError.stack
      });
      
      return res.status(201).json({
        success: true,
        message: 'Account created but verification email failed to send. Please use resend verification option.',
        emailError: true,
        email: email
      });
    }

    // Return success
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email for verification instructions.',
      email: email
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create account',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}