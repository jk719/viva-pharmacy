// src/middleware/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export default function authMiddleware(handler) {
  return async (req, res) => {
    console.log("Auth middleware triggered");

    // Extract token from the "Authorization" header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No Authorization header provided");
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log("No token found in Authorization header");
      return res.status(401).json({ message: 'Unauthorized - Invalid token format' });
    }

    try {
      // Verify token using JWT secret
      console.log("Verifying token...");
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token verified successfully:", decoded);

      // Attach decoded user data to request
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: 'Unauthorized - Invalid or expired token' });
    }
  };
}
