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
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      to: email,
      subject: 'Verify your Viva Pharmacy account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2C5282;">Welcome to Viva Pharmacy!</h1>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background-color: #4299E1; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                    margin: 20px 0;">
            Verify Email
          </a>
          <p style="color: #666;">If you didn't create an account, you can safely ignore this email.</p>
          <p style="color: #666;">This verification link will expire in 24 hours.</p>
          <p style="color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        </div>
      `
    };

    const result = await sendEmail(mailOptions);
    console.log('Verification email sent successfully');
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};