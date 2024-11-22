import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// General email sending function
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully');
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Specific verification email function
export const sendVerificationEmail = async (email, token) => {
  // Determine the correct base URL based on environment
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXTAUTH_URL || 'https://viva-pharmacy.vercel.app'
    : 'http://localhost:3000';

  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  console.log('Sending verification email with URL:', verificationUrl);

  // Validate API key exists
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    throw new Error('Email service not configured');
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Viva Pharmacy <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #003366;">Welcome to Viva Pharmacy!</h1>
            <p>Thank you for registering. Please verify your email address to complete your registration:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #003366; color: white; text-decoration: none; border-radius: 4px;">
                Verify Email
              </a>
            </div>
            <p style="color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
            <p style="color: #666;">This link will expire in 24 hours.</p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Email API error:', data);
      throw new Error(data.message || 'Failed to send email');
    }

    console.log('Email sent successfully');
    return data;

  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
};