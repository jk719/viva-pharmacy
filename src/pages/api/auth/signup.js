import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { validatePassword } from '../../../lib/passwordValidation';
import { validateEmail } from '../../../lib/validation';
import { sendVerificationEmail } from '../../../lib/email';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    const { username, email, password } = req.body;
    console.log('Received signup request for:', { username, email });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated verification token');

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      emailVerificationToken: verificationToken,
      isVerified: false
    });

    console.log('User created, sending verification email');

    // Send verification email
    await sendVerificationEmail(email, verificationToken);
    console.log('Verification email sent');

    res.status(201).json({
      success: true,
      message: 'Please check your email to verify your account'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Failed to create account',
      details: error.message 
    });
  }
}