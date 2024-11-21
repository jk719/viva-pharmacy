import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    const { token } = req.body;
    console.log('Verifying token:', token);

    if (!token) {
      console.log('No token provided');
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find user with token and check expiration
    const user = await User.findOne({ 
      emailVerificationToken: token,
      isVerified: false,
      verificationExpires: { $gt: new Date() }
    });

    if (!user) {
      console.log('Invalid or expired token');
      return res.status(400).json({ 
        error: 'Invalid or expired verification token',
        details: 'The verification link may have expired or already been used.'
      });
    }

    console.log('User found:', {
      email: user.email,
      currentVerificationStatus: user.isVerified
    });

    // Verify the user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    console.log('Email verified successfully for user:', user.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
      redirectUrl: 'https://viva-pharmacy.vercel.app' // Add explicit redirect URL
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      message: 'An error occurred during verification. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}