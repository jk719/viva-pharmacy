// src/pages/api/protectedRoute.js
import authMiddleware from '../../middleware/auth';

async function protectedHandler(req, res) {
  // You can access `req.user` here, which was set in the auth middleware
  res.status(200).json({ message: 'This is a protected route', user: req.user });
}

export default authMiddleware(protectedHandler);
