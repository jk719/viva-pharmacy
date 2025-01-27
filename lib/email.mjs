import nodemailer from 'nodemailer';

// Create reusable transporter with Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Only log email configuration once in development
let configLogged = false;
const logEmailConfig = () => {
  if (!configLogged && process.env.NODE_ENV === 'development') {
    console.log('Email service initialized with:', {
      service: 'gmail',
      user: process.env.GMAIL_USER,
    });
    configLogged = true;
  }
};

// General email sending function
export const sendEmail = async ({ to, subject, html }) => {
  logEmailConfig();

  try {
    const result = await transporter.sendMail({
      from: `Viva Pharmacy <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Email sent successfully to:', to);
    }
    
    return result;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
};

// Password reset email function (keeping this as it's a different use case)
export const sendPasswordResetEmail = async (email, token) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password/${token}`;

  try {
    return await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Reset Your Password</h1>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #003366; 
                      color: white; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Password reset email failed:', error.message);
    throw error;
  }
};

// Verify email configuration only once on startup
let verificationComplete = false;
if (!verificationComplete) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error('Email configuration error:', error.message);
    } else if (process.env.NODE_ENV === 'development') {
      console.log('Email service ready');
    }
    verificationComplete = true;
  });
}