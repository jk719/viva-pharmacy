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