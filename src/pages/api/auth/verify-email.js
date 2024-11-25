// src/pages/api/auth/verify-email.js
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('Starting verification process');
    await dbConnect();
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    // Get current session
    const session = await getServerSession(req, res, authOptions);
    console.log('Current session before verification:', session);

    // Find and update user
    const user = await User.findOneAndUpdate(
      {
        emailVerificationToken: token,
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
    ).select('-password');

    if (!user) {
      console.error('No user found with token');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }

    console.log('User verified successfully:', user.email);

    // Update all instances of this user (if any duplicates exist)
    await User.updateMany(
      { email: user.email },
      {
        $set: {
          isVerified: true,
          emailVerificationToken: null,
          verificationExpires: null
        }
      }
    );

    // Create a fresh session object
    const updatedSession = {
      ...session,
      user: {
        ...session?.user,
        isVerified: true,
        id: user._id.toString(),
        email: user.email,
        role: user.role || 'user'
      }
    };

    console.log('Updated session data:', updatedSession);

    return res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully',
      session: updatedSession,
      user: {
        id: user._id.toString(),
        email: user.email,
        isVerified: true,
        role: user.role || 'user'
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Verification failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}