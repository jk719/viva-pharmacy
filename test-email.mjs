import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get command line arguments
const args = process.argv.slice(2);
const toEmail = args[0] || 'jamilkabir.dev@gmail.com';
const subject = args[1] || 'Test Email';
const body = args[2] || '<h1>Test Email</h1><p>This is a test email.</p>';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Debug function to safely print environment variable
const debugEnvVar = (name) => {
  const value = process.env[name];
  return value ? `${value.substring(0, 3)}...` : 'undefined';
};

// Print current working directory and files
console.log('📂 Current directory:', process.cwd());
console.log('📂 Script directory:', __dirname);

// Load environment variables
const envPath = join(__dirname, '.env.local');
console.log('📄 Looking for .env.local at:', envPath);

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
  
  // Read and print file content (safely)
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim());
  console.log('📝 Number of non-empty lines in .env.local:', envLines.length);
  
  // Load environment variables
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Error loading .env.local:', result.error.message);
  } else {
    console.log('✅ .env.local loaded successfully');
  }
} else {
  console.error('❌ .env.local file not found!');
}

// Debug environment variables
console.log('\n🔍 Environment Variables Check:');
console.log({
  GMAIL_USER: debugEnvVar('GMAIL_USER'),
  GMAIL_APP_PASSWORD: debugEnvVar('GMAIL_APP_PASSWORD'),
  EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
  EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
  NODE_ENV: process.env.NODE_ENV
});

// Only proceed if we have the required variables
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error('\n❌ Required environment variables are missing!');
  process.exit(1);
}

// Now import the email module
import { sendOrderConfirmationEmail } from './lib/email/sendEmail.js';

async function testEmail() {
  try {
    console.log('\n🚀 Starting email test...');
    console.log('📧 Sending to:', toEmail);
    
    const result = await sendOrderConfirmationEmail(
      toEmail,
      subject,
      body
    );
    
    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmail(); 