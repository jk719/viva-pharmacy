import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

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
        error: 'Invalid or expired verification token' 
      });
    }

    console.log('User found, verifying email');

    // Verify the user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    console.log('Email verified successfully');

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      details: error.message 
    });
  }
}