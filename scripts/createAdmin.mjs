import { connect } from 'mongoose';
import pkg from 'bcryptjs';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './tempUserModel.mjs';  // Import the temporary User model
const { hash } = pkg;

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Update these with your desired admin credentials
const ADMIN_EMAIL = 'mathtutorjamil@gmail.com';
const ADMIN_PASSWORD = 'Admin123!';
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');

async function createAdminUser() {
  try {
    await connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('----------------------------------------');
      console.log('Admin user already exists');
      if (existingAdmin.role !== 'ADMIN') {
        existingAdmin.role = 'ADMIN';
        await existingAdmin.save();
        console.log('Updated existing user to admin role');
      }
      console.log('Email:', ADMIN_EMAIL);
      console.log('----------------------------------------');
      process.exit(0);
    }

    // Create admin user with all required fields
    const hashedPassword = await hash(ADMIN_PASSWORD, 12);
    const admin = new User({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      name: 'Admin User',
      // Add default values for required fields from your main User model
      vivaBucks: 0,
      rewardPoints: 0,
      cumulativePoints: 0,
      currentTier: 'STANDARD',
      pointsMultiplier: 1,
      nextRewardMilestone: 100,
      addresses: [],
      rewardHistory: []
    });

    await admin.save();
    console.log('----------------------------------------');
    console.log('Admin user created successfully!');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('Please change your password after first login');
    console.log('----------------------------------------');

  } catch (error) {
    console.error('Error creating admin:', error);
    console.error('Error details:', error.message);
    if (error.name === 'MongoServerError') {
      console.error('MongoDB connection error. Please check your connection string and credentials.');
    }
  } finally {
    process.exit(0);
  }
}

createAdminUser(); 