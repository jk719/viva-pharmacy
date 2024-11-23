import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully',
      isVerified: true
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ success: false, error: 'Verification failed' });
  }
}