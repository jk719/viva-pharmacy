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

export async function sendOrderConfirmationEmail(to, emailContent) {
    try {
        console.log('🚀 Starting email send process...');
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        // Send mail with proper content type
        console.log('📤 Attempting to send email to:', to);
        const info = await transporter.sendMail({
            from: `"Viva Pharmacy" <${process.env.GMAIL_USER}>`,
            to,
            subject: 'Your Viva Pharmacy Order Confirmation',
            html: emailContent,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Environment': process.env.NODE_ENV,
                'X-Priority': '1',
                'X-Application': 'Viva Pharmacy'
            }
        });

        console.log('✅ Email sent successfully:', {
            messageId: info.messageId,
            response: info.response
        });

        return info;
    } catch (error) {
        console.error('❌ Email send error:', error);
        throw error;
    }
} 