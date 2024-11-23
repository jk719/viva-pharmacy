import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug: Log environment variables (remove in production)
  console.log('Debug - Environment variables:', {
    GMAIL_USER_EXISTS: !!process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD_EXISTS: !!process.env.GMAIL_APP_PASSWORD,
    GMAIL_USER_VALUE: process.env.GMAIL_USER,
  });

  // Create transporter with more detailed configuration
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    debug: true // Enable debug logs
  });

  try {
    // Verify transporter configuration
    await transporter.verify();
    console.log('Email configuration verified');

    // Send test email
    const info = await transporter.sendMail({
      from: `Viva Pharmacy <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Sending to yourself for testing
      subject: 'Test Email from Viva Pharmacy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #003366;">Test Email</h1>
          <p>This is a test email from your Viva Pharmacy application.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    console.log('Test email sent:', info.messageId);
    res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      credentials: {
        userExists: !!process.env.GMAIL_USER,
        passwordExists: !!process.env.GMAIL_APP_PASSWORD
      }
    });

    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        command: error.command
      } : undefined
    });
  }
}
