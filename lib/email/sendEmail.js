import nodemailer from 'nodemailer';
import { generateOrderConfirmationEmail } from '@/lib/email-templates/order-confirmation';

// Add helper function to validate image URLs
const validateImageUrl = (url) => {
    if (!url) return null;
    try {
        // Ensure URL is absolute
        if (!url.startsWith('http')) {
            return `${process.env.NEXT_PUBLIC_BASE_URL}${url}`;
        }
        return url;
    } catch (e) {
        console.warn('Invalid image URL:', url);
        return null;
    }
};

export async function sendOrderConfirmationEmail(to, emailData) {
    // Validate and normalize image URLs in items
    const normalizedItems = emailData.items?.map(item => ({
        ...item,
        image: validateImageUrl(item.image)
    }));

    // Create normalized email data
    const normalizedEmailData = {
        ...emailData,
        items: normalizedItems
    };

    // Add detailed logging of normalized email data
    console.log('📧 Processing normalized email data:', {
        orderNumber: normalizedEmailData.orderNumber,
        items: normalizedEmailData.items?.map(item => ({
            name: item.name,
            hasImage: !!item.image,
            imageUrl: item.image?.substring(0, 50) + '...',
            price: item.price,
            quantity: item.quantity
        })),
        totals: {
            subtotal: normalizedEmailData.subtotal,
            tax: normalizedEmailData.tax,
            total: normalizedEmailData.total
        }
    });

    try {
        console.log('🚀 Starting email send process...');
        
        // Generate the HTML using the template
        const html = generateOrderConfirmationEmail(normalizedEmailData);
        
        // Create the subject line
        const subject = `Viva Pharmacy Order Confirmation #${normalizedEmailData.orderNumber}`;

        // Log configuration (with sensitive data masked)
        console.log('📧 Email Configuration:', {
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT,
            user: process.env.GMAIL_USER?.replace(/@.*$/, '@...'),
            hasPassword: !!process.env.GMAIL_APP_PASSWORD,
            environment: process.env.NODE_ENV
        });

        // Create transporter with Gmail configuration
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            },
            debug: true,
            logger: true
        });

        // Verify connection
        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');

        // Send mail
        console.log('📤 Attempting to send email to:', to.replace(/@.*$/, '@...'));
        const info = await transporter.sendMail({
            from: `"Viva Pharmacy" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
            headers: {
                'X-Environment': process.env.NODE_ENV,
                'X-Priority': '1',
                'X-Application': 'Viva Pharmacy'
            }
        });

        console.log('✅ Email sent successfully:', {
            messageId: info.messageId,
            response: info.response,
            to: to.replace(/@.*$/, '@...'),
            subject
        });

        return info;
    } catch (error) {
        console.error('❌ Email send error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            command: error.command,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            emailData: {
                orderNumber: normalizedEmailData.orderNumber,
                itemCount: normalizedEmailData.items?.length
            }
        });
        
        throw error;
    }
} 