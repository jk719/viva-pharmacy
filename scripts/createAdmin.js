import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth/password';

async function createAdminUser() {
  try {
    await dbConnect();

    const adminEmail = 'your-email@example.com'; // Change this
    const adminPassword = 'your-secure-password'; // Change this

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword(adminPassword);
    const admin = new User({
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true
    });

    await admin.save();
    console.log('Admin user created successfully');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    process.exit();
  }
}

createAdminUser(); 