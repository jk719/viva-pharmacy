// src/pages/api/auth/userProfile.js
import dbConnect from '../../../lib/dbConnect';
import authMiddleware from '../../../middleware/auth';

async function handler(req, res) {
  await dbConnect();

  // Fetch user data using req.user.userId
  res.status(200).json({ message: 'Protected route', userId: req.user.userId });
}

export default authMiddleware(handler);
