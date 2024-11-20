import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    const { username, email, password } = req.body;
    console.log('Received registration request for:', email);

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Username or email already exists'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated verification token');

    // Create user with verification token
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      emailVerificationToken: verificationToken,
      isVerified: false,
      verificationExpires: new Date(Date.now() + 24*60*60*1000) // 24 hours
    });

    console.log('User created, sending verification email');

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your Viva Pharmacy account',
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
          </div>
        `
      });
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(201).json({
        success: true,
        message: 'Account created but verification email failed to send. Please contact support.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Please check your email to verify your account'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Failed to create account',
      details: error.message 
    });
  }
}