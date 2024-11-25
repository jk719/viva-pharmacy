// src/pages/api/auth/verify-email.js
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  let session = null;
  try {
    await dbConnect();
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    // Get current session first
    session = await getServerSession(req, res, authOptions);

    // Use findOneAndUpdate for atomic operation
    const user = await User.findOneAndUpdate(
      {
        emailVerificationToken: token,
        isVerified: false,
        verificationExpires: { $gt: new Date() }
      },
      {
        $set: {
          isVerified: true,
          emailVerificationToken: null,
          verificationExpires: null
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired token, or email already verified' 
      });
    }

    // Update session data if it exists
    if (session?.user) {
      session.user.isVerified = true;
    }

    // Return success with session data
    return res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully',
      user: {
        ...user._doc,
        password: undefined // Remove sensitive data
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Verification failed' 
    });
  }
}