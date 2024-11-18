// src/pages/api/auth/register.js
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  // Connect to MongoDB
  try {
    await dbConnect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection error:", error.message);
    return res.status(500).json({ message: 'Database connection failed' });
  }

  // Ensure request method is POST
  if (req.method === 'POST') {
    const { username, email, password } = req.body;

    try {
      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }

      // Check if the username or email already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already taken' });
      }

      // Create a new user (password will be hashed by the User model's pre-save hook)
      const newUser = new User({ username, email, password });
      await newUser.save();

      // Log successful registration (avoid logging sensitive data)
      console.log("User registered successfully with email:", newUser.email);

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error("Registration error:", error.message);
      res.status(500).json({ message: 'Something went wrong during registration' });
    }
  } else {
    // Respond with 405 if the method is not allowed
    res.status(405).json({ message: 'Method not allowed' });
  }
}
