require('dotenv').config({ path: '.env.local' });
const { sendOrderConfirmationEmail } = require('./lib/email/sendEmail');
const { generateOrderConfirmationEmail } = require('./lib/email-templates/order-confirmation');

const testOrder = {
    orderNumber: 'TEST-123',
    customerName: 'Test User',
    items: [{
        name: 'Test Product',
        price: 19.99,
        quantity: 1,
        image: 'https://res.cloudinary.com/your-cloud-name/image/upload/test-image.jpg'
    }],
    subtotal: 19.99,
    tax: 1.99,
    total: 21.98,
    deliveryMethod: 'pickup',
    selectedTime: '2:00 PM',
    shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
    }
};

async function testEmail() {
    try {
        console.log('🚀 Generating test email content...');
        const emailContent = generateOrderConfirmationEmail(testOrder);
        
        console.log('📧 Sending test email...');
        const result = await sendOrderConfirmationEmail(
            'your-test-email@example.com',
            emailContent
        );

        console.log('✅ Test email sent successfully:', result);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testEmail(); 