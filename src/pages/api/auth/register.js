import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { email, password, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Create user with automatic verification for development
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      phoneNumber,
      isVerified: true, // Temporarily set to true for development
      emailVerificationToken: undefined,
      verificationExpires: undefined
    });

    // Return success
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      email: email,
      password: password // This will be used for auto-login only
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create account'
    });
  }
}