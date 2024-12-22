import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sendOrderConfirmationEmail } from './lib/email/sendEmail.js';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

// Verify environment variables are loaded
console.log('Environment check:', {
  hasGmailUser: !!process.env.GMAIL_USER,
  hasGmailPass: !!process.env.GMAIL_APP_PASSWORD,
  gmailUserLength: process.env.GMAIL_USER?.length,
  gmailPassLength: process.env.GMAIL_APP_PASSWORD?.length
});

async function testEmail() {
  try {
    await sendOrderConfirmationEmail(
      'jamilkabir.dev@gmail.com',
      'Test Email from Viva Pharmacy',
      '<h1>This is a test email</h1><p>If you receive this, the email configuration is working.</p>'
    );
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
  process.exit(0);
}

testEmail(); 