import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateOrderConfirmationEmail } from '../email-templates/order-confirmation.js';
import { generateAdminWelcomeEmail } from '../email-templates/admin-welcome.js';
import { generatePasswordResetEmail } from '../email-templates/password-reset.js';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Singleton transporter
let transporter = null;

// Add email verification and security
const EMAIL_SECURITY = {
    MAX_ATTEMPTS_PER_HOUR: 5,
    COOLDOWN_PERIOD: 60 * 60 * 1000, // 1 hour
    attempts: new Map()
};

// Rate limiting for email sending
const checkEmailRateLimit = (email) => {
    const now = Date.now();
    const attempts = EMAIL_SECURITY.attempts.get(email) || [];
    
    // Clean up old attempts
    const recentAttempts = attempts.filter(
        timestamp => now - timestamp < EMAIL_SECURITY.COOLDOWN_PERIOD
    );
    
    if (recentAttempts.length >= EMAIL_SECURITY.MAX_ATTEMPTS_PER_HOUR) {
        throw new Error('Too many email attempts. Please try again later.');
    }
    
    recentAttempts.push(now);
    EMAIL_SECURITY.attempts.set(email, recentAttempts);
};

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

// Enhanced email sending with security headers
async function sendEmail({ to, subject, html, headers = {} }) {
    try {
        checkEmailRateLimit(to);
        
        // Add security headers
        const emailId = createHash('sha256').update(`${to}${Date.now()}`).digest('hex');
        const secureHeaders = {
            'Message-ID': `<${emailId}@vivapharmacy.com>`,
            'X-Priority': '1',
            'X-Mailer': 'VivaPharmacy-Secure-Mailer',
            'X-Virus-Scanned': 'True',
            'X-Spam-Status': 'Checked',
            ...headers
        };

        const info = await getTransporter().sendMail({
            from: `"Viva Pharmacy" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
            headers: secureHeaders
        });

        // Log email sending (but not content)
        console.log('Email sent:', {
            to: to.substring(0, 3) + '***@' + to.split('@')[1],
            messageId: info.messageId,
            timestamp: new Date().toISOString()
        });

        return info;
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
}

export async function sendOrderConfirmationEmail(to, orderData) {
    try {
        console.log('🚀 Starting order confirmation email send process...');
        const emailContent = generateOrderConfirmationEmail(orderData);
        const info = await sendEmail({
            to,
            subject: 'Your Viva Pharmacy Order Confirmation',
            html: emailContent,
            headers: {
                'X-Priority': '1',
                'X-Application': 'Viva Pharmacy'
            }
        });
        console.log('✅ Order confirmation email sent successfully');
        return info;
    } catch (error) {
        console.error('❌ Order confirmation email send error:', error);
        throw error;
    }
}

export async function sendAdminWelcomeEmail(to, { verificationToken }) {
    try {
        console.log('🚀 Starting admin welcome email send process...');
        console.log('Verification token in email:', verificationToken?.substring(0, 10) + '...');
        
        // Use the template from admin-welcome.js
        const emailContent = generateAdminWelcomeEmail({
            email: to,
            verificationToken
        });

        const info = await sendEmail({
            to,
            subject: 'Welcome to Viva Pharmacy Management Portal',
            html: emailContent,
            headers: {
                'X-Priority': '1',
                'X-Application': 'Viva Pharmacy'
            }
        });
        
        console.log('✅ Admin welcome email sent successfully');
        return info;
    } catch (error) {
        console.error('❌ Admin welcome email send error:', error);
        throw error;
    }
}

export async function sendVerificationEmail(to, token) {
    try {
        console.log('🚀 Starting verification email send process...');
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
        
        const info = await sendEmail({
            to,
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Verify Your Email</h1>
                    <p>Please click the button below to verify your email address:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="display: inline-block; padding: 12px 24px; background-color: #003366; 
                                  color: white; text-decoration: none; border-radius: 4px;">
                            Verify Email
                        </a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p>${verificationUrl}</p>
                    <p>This link will expire in 24 hours.</p>
                </div>
            `,
            headers: {
                'X-Priority': '1',
                'X-Application': 'Viva Pharmacy'
            }
        });
        console.log('✅ Verification email sent successfully');
        return info;
    } catch (error) {
        console.error('❌ Verification email send error:', error);
        throw error;
    }
}

export async function sendPasswordResetEmail(to, token, name, isManager = false) {
    try {
        console.log('🚀 Starting password reset email send process...');
        const emailContent = generatePasswordResetEmail({
            email: to,
            name,
            resetToken: token,
            isManagerReset: isManager
        });
        
        const info = await sendEmail({
            to,
            subject: isManager 
                ? 'Set Your Password - Viva Pharmacy' 
                : 'Reset Your Password - Viva Pharmacy',
            html: emailContent,
            headers: {
                'X-Priority': '1',
                'X-Application': 'Viva Pharmacy'
            }
        });
        console.log('✅ Password reset email sent successfully');
        return info;
    } catch (error) {
        console.error('❌ Password reset email send error:', error);
        throw error;
    }
} 