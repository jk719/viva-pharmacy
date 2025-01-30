import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateOrderConfirmationEmail } from '../email-templates/order-confirmation.js';
import { generateAdminWelcomeEmail } from '../email-templates/admin-welcome.js';
import { generatePasswordResetEmail } from '../email-templates/password-reset.js';

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

// Base email sending function
async function sendEmail({ to, subject, html, headers = {} }) {
    const mailer = getTransporter();
    return await mailer.sendMail({
        from: `"Viva Pharmacy" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Environment': process.env.NODE_ENV,
            ...headers
        }
    });
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
        
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
        
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Welcome to Viva Pharmacy Management Portal</h1>
                <p>You have been invited to join as a manager. Please click the button below to verify your email and set up your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                        style="display: inline-block; padding: 12px 24px; background-color: #003366; 
                                color: white; text-decoration: none; border-radius: 4px;">
                        Verify Email & Set Password
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p>${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
            </div>
        `;

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