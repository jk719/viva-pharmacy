import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import crypto from 'crypto';
import { sendVerificationEmail } from '../../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await dbConnect();
    
    // Use the email from the session
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.error('User not found:', session.user.email);
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24*60*60*1000); // 24 hours

    // Update user with new verification token
    user.emailVerificationToken = emailVerificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Send new verification email
    try {
      await sendVerificationEmail(
        user.email,
        emailVerificationToken
      );

      return res.status(200).json({ 
        success: true,
        message: 'Verification email sent successfully' 
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).json({ 
        error: 'Failed to send verification email' 
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}