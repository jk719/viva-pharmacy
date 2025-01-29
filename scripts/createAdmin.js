import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import { hashPassword } from '../lib/auth/password.js';
import { sendEmail } from '../lib/email.mjs';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createAdminUser() {
  try {
    await dbConnect();

    const adminEmail = process.argv[2];
    if (!adminEmail) {
      console.error('Please provide an admin email address');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await hashPassword(tempPassword);

    // Create admin user
    const admin = new User({
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      name: 'Admin User'
    });

    await admin.save();
    console.log('Admin user created successfully');

    // Create email template inline since it's a one-time use
    const emailTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Viva Pharmacy Admin</title>
      </head>
      <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background-color: #003366; color: white; border-radius: 8px; margin-bottom: 20px;">
            <h1>Welcome to Viva Pharmacy Admin</h1>
          </div>

          <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p>Hello,</p>
            <p>Your admin account has been created for Viva Pharmacy's management system.</p>

            <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Email:</strong> ${adminEmail}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>

            <p style="color: #d63031; font-weight: bold;">Important: Please change your password after your first login for security purposes.</p>

            <p>To get started:</p>
            <ol>
              <li>Visit <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?showLogin=true">Viva Pharmacy Login</a></li>
              <li>Use your email and temporary password to sign in</li>
              <li>Change your password immediately</li>
            </ol>

            <p>If you have any questions or issues, please contact the system administrator.</p>
          </div>
        </div>
      </body>
    </html>
    `;

    // Send welcome email
    try {
      await sendEmail({
        to: adminEmail,
        subject: 'Welcome to Viva Pharmacy Admin',
        html: emailTemplate
      });
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    console.log('Temporary password:', tempPassword);
    console.log('Please save this password and provide it to the admin securely');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    process.exit();
  }
}

createAdminUser(); 