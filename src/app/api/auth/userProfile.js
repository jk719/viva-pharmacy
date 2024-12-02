// src/pages/api/auth/userProfile.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    await dbConnect();
    
    // Fetch full user data from database
    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ 
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        // Add any other user fields you want to expose
      }
    });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ error: "Error fetching user profile" });
  }
}

export default handler;
