import nodemailer from 'nodemailer';

export async function sendOrderConfirmationEmail(to, subject, html) {
    console.log('🔍 Email Configuration:', {
        environment: process.env.NODE_ENV,
        user: process.env.GMAIL_USER,
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        isProduction: process.env.NODE_ENV === 'production'
    });

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    try {
        console.log('✅ SMTP Server is ready to send emails');
        
        const info = await transporter.sendMail({
            from: `"Viva Pharmacy" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log('📧 Email sent successfully:', {
            messageId: info.messageId,
            to,
            subject
        });

        return info;
    } catch (error) {
        console.error('❌ Failed to send email:', {
            error: error.message,
            config: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                user: process.env.GMAIL_USER
            }
        });
        throw error;
    }
} 