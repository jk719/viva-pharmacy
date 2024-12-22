require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  debug: true
});

// Verify environment variables are loaded
console.log('Environment check:', {
  hasGmailUser: !!process.env.GMAIL_USER,
  hasGmailPass: !!process.env.GMAIL_APP_PASSWORD,
  emailHost: process.env.EMAIL_SERVER_HOST,
  emailPort: process.env.EMAIL_SERVER_PORT
});

async function testEmail() {
  try {
    console.log('Attempting to send test email...');
    
    const info = await transporter.sendMail({
      from: `"Viva Pharmacy Test" <${process.env.GMAIL_USER}>`,
      to: 'jamilkabir.dev@gmail.com', // your email address
      subject: 'Test Email from Viva Pharmacy ' + new Date().toISOString(),
      html: `
        <h1>This is a test email</h1>
        <p>If you receive this, the email configuration is working.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    });

    console.log('✅ Test email sent successfully!', {
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope
    });
  } catch (error) {
    console.error('❌ Error sending test email:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
  }
}

// Verify SMTP connection first
console.log('🔄 Verifying SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection error:', error);
  } else {
    console.log('✅ SMTP connection successful');
    testEmail();
  }
}); 