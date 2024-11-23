import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// General email sending function
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Specific verification email function
export const sendVerificationEmail = async (email, token) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXTAUTH_URL 
    : 'http://localhost:3000';

  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  console.log('Sending verification email with URL:', verificationUrl);

  try {
    const result = await sendEmail({
      to: email,
      subject: 'Verify your Viva Pharmacy account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">Welcome to Viva Pharmacy!</h1>
          <p>Thank you for registering. Please verify your email address to complete your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #003366; 
                      color: white; text-decoration: none; border-radius: 4px;">
              Verify Email
            </a>
          </div>
          <p style="color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #666;">This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account with Viva Pharmacy, please ignore this email.
          </p>
        </div>
      `
    });

    console.log('Verification email sent successfully');
    return result;

  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};