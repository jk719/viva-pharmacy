import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendVerificationEmail = async (email, token) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Viva Pharmacy account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2C5282;">Welcome to Viva Pharmacy!</h1>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${process.env.NEXTAUTH_URL}/verify-email?token=${token}" 
             style="display: inline-block; background-color: #4299E1; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                    margin: 20px 0;">
            Verify Email
          </a>
          <p style="color: #666;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};