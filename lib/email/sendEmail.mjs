import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateOrderConfirmationEmail } from '../email-templates/order-confirmation.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Singleton transporter
let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    }
    return transporter;
}

export async function sendOrderConfirmationEmail(to, orderData) {
    try {
        console.log('🚀 Starting email send process...');
        
        if (!to || !orderData) {
            throw new Error('Missing required email parameters');
        }

        const emailContent = generateOrderConfirmationEmail(orderData);
        const mailer = getTransporter();

        const info = await mailer.sendMail({
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

export async function sendVerificationEmail(to, token) {
    // ... rest of the verification email code remains the same ...
} 