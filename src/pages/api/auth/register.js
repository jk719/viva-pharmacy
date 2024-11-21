import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import crypto from 'crypto';
import { sendEmail } from '../../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    await dbConnect();
    console.log('Connected to MongoDB');

    const { username, email, password } = req.body;
    console.log('REGISTER - Received request:', {
      email,
      passwordLength: password?.length,
      isPasswordHashed: password?.startsWith('$2a$')
    });

    // Validate input
    if (!username || !email || !password) {
      console.log('Missing required fields:', { 
        username: !!username, 
        email: !!email, 
        password: !!password 
      });
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      const existingDetails = {
        existingEmail: existingUser.email === email.toLowerCase(),
        existingUsername: existingUser.username === username.toLowerCase()
      };
      console.log('User already exists:', existingDetails);
      return res.status(400).json({
        error: 'Username or email already exists',
        details: existingDetails
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated verification token');

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: password,
      emailVerificationToken: verificationToken,
      isVerified: false,
      verificationExpires: new Date(Date.now() + 24*60*60*1000)
    });

    console.log('REGISTER - User created:', {
      userId: user._id,
      username: user.username,
      isVerified: user.isVerified
    });

    // Use the production URL directly
    const verificationUrl = `https://viva-pharmacy.vercel.app/verify-email?token=${verificationToken}`;
    console.log('Generated verification URL:', verificationUrl);

    try {
      await sendEmail({
        to: email,
        subject: 'Verify your VIVA Pharmacy & Wellness account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2C5282;">Welcome to Viva Pharmacy!</h1>
            <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #4299E1; color: white; 
                      padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                      margin: 20px 0;">
              Verify Email
            </a>
            <p style="color: #666;">If you didn't create an account, you can safely ignore this email.</p>
            <p style="color: #666;">This verification link will expire in 24 hours.</p>
            <p style="color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          </div>
        `
      });
      console.log('Verification email sent successfully to:', email);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(201).json({
        success: true,
        message: 'Account created but verification email failed to send. Please contact support.',
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

    res.status(201).json({
      success: true,
      message: 'Please check your email to verify your account'
    });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    res.status(500).json({ 
      error: 'Failed to create account',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}