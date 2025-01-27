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

export async function sendVerificationEmail(to, token) {
    try {
        console.log('🚀 Starting verification email send process...');
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;
        
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Verify Your Viva Pharmacy Account</h2>
                <p>Thank you for registering with Viva Pharmacy. Please click the button below to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #FF9F43; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    If you didn't create an account with Viva Pharmacy, please ignore this email.
                </p>
                <p style="color: #666; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                </p>
            </div>
        `;

        console.log('📤 Attempting to send verification email to:', to);
        const info = await transporter.sendMail({
            from: `"Viva Pharmacy" <${process.env.GMAIL_USER}>`,
            to,
            subject: 'Verify Your Viva Pharmacy Account',
            html: emailContent,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Environment': process.env.NODE_ENV,
                'X-Priority': '1',
                'X-Application': 'Viva Pharmacy'
            }
        });

        console.log('✅ Verification email sent successfully:', {
            messageId: info.messageId,
            response: info.response
        });

        return info;
    } catch (error) {
        console.error('❌ Verification email send error:', error);
        throw error;
    }
} 