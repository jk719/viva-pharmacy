import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

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
    
    // Use the email from the session instead of the request body
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.error('User not found:', session.user.email);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Verification check for user:', {
      email: user.email,
      isVerified: user.isVerified
    });

    return res.status(200).json({ 
      isVerified: user.isVerified 
    });

  } catch (error) {
    console.error('Error checking verification status:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}