import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function makeAdmin() {
  try {
    const email = 'vivajacksonheights@gmail.com';
    
    await dbConnect();
    console.log('Connected to database');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }

    // Log current state
    console.log('Current user state:', {
      email: user.email,
      currentRole: user.role,
      name: user.name,
      isVerified: user.isVerified
    });

    // Update user role to ADMIN
    user.role = 'ADMIN';
    await user.save();

    console.log('✅ Successfully updated user to ADMIN role');
    console.log('Updated user details:', {
      email: user.email,
      newRole: user.role,
      name: user.name,
      isVerified: user.isVerified
    });

  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    process.exit();
  }
}

makeAdmin(); 