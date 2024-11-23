import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { sendVerificationEmail } from '../../../lib/email';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get session to verify user is logged in
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    await dbConnect();
    const email = session.user.email;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is already verified' 
      });
    }

    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send new verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
      console.log('Resent verification email to:', email);

      return res.status(200).json({
        success: true,
        message: 'Verification email resent successfully'
      });
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email',
        details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to resend verification email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}