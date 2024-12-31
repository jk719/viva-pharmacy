require('dotenv').config({ path: '.env.local' });
const { sendOrderConfirmationEmail } = require('./lib/email/sendEmail');

// Get command line arguments
const args = process.argv.slice(2);
const toEmail = args[0] || 'jamilkabir.dev@gmail.com';
const subject = args[1] || `Test Email from Viva Pharmacy ${new Date().toISOString()}`;
const customHtml = args[2] || `
    <h1>This is a test email</h1>
    <p>If you receive this, the email configuration is working.</p>
    <p>Sent at: ${new Date().toLocaleString()}</p>
`;

console.log('📧 Test Email Configuration:', {
    to: toEmail,
    subject: subject,
    bodyPreview: customHtml.substring(0, 100) + '...',
    environment: process.env.NODE_ENV || 'development'
});

async function testEmail() {
    try {
        console.log('🚀 Attempting to send test email...');
        
        const result = await sendOrderConfirmationEmail(
            toEmail,
            subject,
            customHtml
        );

        console.log('✅ Test email sent successfully:', {
            to: toEmail,
            messageId: result.messageId,
            success: result.success
        });
    } catch (error) {
        console.error('❌ Error sending test email:', {
            message: error.message,
            code: error.code,
            command: error.command
        });
        process.exit(1);
    }
}

// Start the test
testEmail(); 