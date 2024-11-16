// src/pages/api/auth/register.js
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { username, email, password } = req.body;

    try {
      // Check if username, email, and password are provided
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }

      // Check if the username or email already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already taken' });
      }

      // Create a new user (password will be hashed by the pre-save hook in User model)
      const newUser = new User({ username, email, password });
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: 'Something went wrong during registration' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
