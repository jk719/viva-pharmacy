import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Explicitly set service to gmail
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,  // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ SMTP configuration error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

export async function sendOrderConfirmationEmail(to, subject, html) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Email configuration missing. Please check GMAIL_USER and GMAIL_APP_PASSWORD in .env');
    throw new Error('Email configuration missing');
  }

  try {
    console.log('📧 Attempting to send email to:', to);
    
    const info = await transporter.sendMail({
      from: `"Viva Pharmacy" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      to: to,
      subject: subject
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', {
      error: error.message,
      stack: error.stack,
      to: to,
      subject: subject
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Add verification email function
export async function sendVerificationEmail(to, token) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Viva Pharmacy!</h2>
      <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #4CAF50; color: white; padding: 14px 28px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;

  return sendOrderConfirmationEmail(
    to,
    "Verify your Viva Pharmacy account",
    html
  );
} 