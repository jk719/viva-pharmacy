import nodemailer from 'nodemailer';

// Create reusable transporter with Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Add some debug logging
console.log('Email configuration:', {
  service: 'gmail',
  user: process.env.GMAIL_USER,
  pass: process.env.GMAIL_APP_PASSWORD ? '**********' : undefined // Don't log the actual password
});

// General email sending function
export const sendEmail = async ({ to, subject, html }) => {
  console.log('Sending email with configuration:', {
    service: 'gmail',
    user: process.env.GMAIL_USER,
    from: process.env.GMAIL_USER,
    to: to,
    subject: subject
  });

  try {
    const result = await transporter.sendMail({
      from: `Viva Pharmacy <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('Detailed email sending error:', error);
    throw error;
  }
};

// Specific verification email function
export const sendVerificationEmail = async (email, verificationToken) => {
  // Use localhost in development, actual domain in production
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://viva-pharmacy.vercel.app'
    : 'http://localhost:3000';
    
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

  console.log('Sending verification email with details:', {
    to: email,
    url: verificationUrl,
    from: process.env.GMAIL_USER
  });

  try {
    const result = await sendEmail({
      to: email,
      subject: 'Verify your Viva Pharmacy account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">Welcome to Viva Pharmacy!</h1>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #003366; 
                      color: white; text-decoration: none; border-radius: 4px;">
              Verify Email
            </a>
          </div>
          <p style="color: #666;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #666;">This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account with Viva Pharmacy, please ignore this email.
          </p>
        </div>
      `
    });

    console.log('Verification email sent successfully to:', email);
    return result;

  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};

// Test the email configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;
  
  const emailContent = {
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h1>Reset Your Password</h1>
      <p>You requested to reset your password. Click the button below to set a new password:</p>
      <a href="${resetUrl}" style="background-color: #003366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  try {
    await sendEmail(emailContent);
  } catch (error) {
    console.error('Error sending reset password email:', error);
    throw error;
  }
}