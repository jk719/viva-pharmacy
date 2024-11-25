import nodemailer from 'nodemailer';

// Create reusable transporter with Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// General email sending function
export const sendEmail = async ({ to, subject, html }) => {
  console.log('Sending email with configuration:', {
    service: 'gmail',
    user: process.env.GMAIL_USER,
    from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
    to: to,
    subject: subject
  });

  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `Viva Pharmacy <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('Detailed email sending error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    throw error;
  }
};

// Specific verification email function
export const sendVerificationEmail = async (email, verificationUrl) => {
  console.log('Sending verification email with details:', {
    to: email,
    url: verificationUrl,
    from: process.env.EMAIL_FROM || process.env.GMAIL_USER
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
    console.error('Failed to send verification email:', {
      to: email,
      error: error.message,
      code: error.code,
      command: error.command
    });
    throw error;
  }
};

// Test the email configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email configuration error:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
  } else {
    console.log('Email server is ready to send messages');
  }
});