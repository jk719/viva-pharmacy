import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.verificationExpires = new Date(Date.now() + 24*60*60*1000); // 24 hours
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Viva Pharmacy account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2C5282;">Verify Your Email</h1>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background-color: #4299E1; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                    margin: 20px 0;">
            Verify Email
          </a>
          <p style="color: #666;">If you didn't request this email, you can safely ignore it.</p>
          <p style="color: #666;">This verification link will expire in 24 hours.</p>
        </div>
      `
    });

    res.status(200).json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
}