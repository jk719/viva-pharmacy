import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { sendVerificationEmail } from '../../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting registration process...');
    await dbConnect();
    
    const { email, password, phoneNumber } = req.body;
    console.log('Registering email:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save hook
      phoneNumber,
      isVerified: false
    });

    // Generate verification token using the model method
    const verificationToken = user.generateVerificationToken();
    console.log('Generated verification token');

    // Save the user
    await user.save();
    console.log('User created successfully:', user.email);

    // Send verification email
    try {
      console.log('Attempting to send verification email...');
      await sendVerificationEmail(user.email, verificationToken);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration but log the error
    }

    // Return success
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email for verification instructions.',
      email: email
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create account'
    });
  }
}