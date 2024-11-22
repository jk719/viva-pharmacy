import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    await dbConnect();
    const { token } = req.body;

    console.log('Received verification request for token:', token); // Debug log

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Verification token is required' 
      });
    }

    // Find user with matching token and token not expired
    const user = await User.findOne({
      emailVerificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    console.log('Found user:', user ? user.email : 'No user found'); // Debug log

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired verification token' 
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    console.log('User verified successfully:', user.email);

    return res.status(200).json({ 
      success: true,
      message: 'Email verified successfully' 
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to verify email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}