import nodemailer from 'nodemailer';
import { createHash } from 'crypto';
import emailConfig, { createTransporter } from './config';
import { emailTemplates } from './emailTemplates';
import emailMonitoring from './monitoring';

// Email security rate limiting singleton
const EMAIL_SECURITY = {
  attempts: new Map()
};

class EmailService {
  constructor() {
    // Initialize the transporter with the unified configuration
    this.transporter = nodemailer.createTransport(createTransporter());
    
    // Rate limit settings from config
    this.rateLimitSettings = emailConfig.rateLimiting;
    
    console.log('📧 Email service initialized with monitoring');
  }

  /**
   * Check if an email is rate limited
   * @param {string} email - The email address to check
   * @returns {boolean} - True if rate limited, false otherwise
   */
  checkEmailRateLimit(email) {
    // Skip rate limiting if disabled
    if (!this.rateLimitSettings.enabled) {
      return false;
    }
    
    const now = Date.now();
    const attempts = EMAIL_SECURITY.attempts.get(email) || [];
    
    // Clean up old attempts
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < this.rateLimitSettings.cooldownPeriod
    );
    
    if (recentAttempts.length >= this.rateLimitSettings.maxAttemptsPerHour) {
      return true; // Rate limited
    }
    
    // Record this attempt
    recentAttempts.push(now);
    EMAIL_SECURITY.attempts.set(email, recentAttempts);
    return false; // Not rate limited
  }

  /**
   * Core method to send an email using a template
   */
  async sendEmail(to, templateName, userData) {
    try {
      // Check rate limiting
      if (this.checkEmailRateLimit(to)) {
        const error = new Error(`Rate limit exceeded for ${to}. Please try again later.`);
        // Record rate limit failure in monitoring
        emailMonitoring.recordEmailFailed(templateName, to, error, { reason: 'rate_limit' });
        throw error;
      }

      // Verify template exists
      if (!emailTemplates[templateName]) {
        const error = new Error(`Email template "${templateName}" not found`);
        // Record template error in monitoring
        emailMonitoring.recordEmailFailed(templateName, to, error, { reason: 'template_not_found' });
        throw error;
      }

      // Get rendered email from template
      const { subject, html } = emailTemplates[templateName](userData);

      // Generate secure message ID
      const emailId = createHash('sha256').update(`${to}${Date.now()}`).digest('hex');
      
      // Set up security headers
      const secureHeaders = {
        'Message-ID': `<${emailId}@${emailConfig.dkim.domainName}>`,
        'X-Priority': '1',
        'X-Mailer': 'VivaPharmacy-Secure-Mailer',
        'X-Virus-Scanned': 'True',
        'X-Spam-Status': 'Checked'
      };

      // Set up mail options with defaults from config
      const mailOptions = {
        from: emailConfig.defaults.from,
        replyTo: emailConfig.defaults.replyTo,
        to,
        subject,
        html,
        headers: secureHeaders
      };

      // Send the email
      const info = await this.transporter.sendMail(mailOptions);
      
      // Log with privacy protection
      const obscuredEmail = to.substring(0, 3) + '***@' + to.split('@')[1];
      console.log('Email sent:', {
        to: obscuredEmail,
        template: templateName,
        messageId: info.messageId,
        timestamp: new Date().toISOString()
      });
      
      // Record successful email in monitoring
      emailMonitoring.recordEmailSent(templateName, to, {
        messageId: info.messageId,
        subject: subject
      });
      
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Record any uncaught errors in monitoring
      if (error.message !== 'Rate limit exceeded' && !error.message.includes('template')) {
        emailMonitoring.recordEmailFailed(templateName || 'unknown', to, error, { 
          reason: 'sending_error',
          errorCode: error.code || 'UNKNOWN'
        });
      }
      
      throw error;
    }
  }

  // Loyalty Program Methods
  async sendPointsEarnedEmail(user, pointsData) {
    return this.sendEmail(user.email, 'pointsEarned', {
      name: user.name,
      pointsEarned: pointsData.earned,
      totalPoints: pointsData.total,
      tier: pointsData.tier,
      nextTierProgress: pointsData.nextTierProgress,
      nextTier: pointsData.nextTier
    });
  }

  async sendTierUpgradeEmail(user, tierData) {
    return this.sendEmail(user.email, 'tierUpgrade', {
      name: user.name,
      newTier: tierData.newTier,
      benefits: tierData.benefits
    });
  }

  async sendNewCouponEmail(user, couponData) {
    return this.sendEmail(user.email, 'newCoupon', {
      name: user.name,
      couponAmount: couponData.amount,
      couponCode: couponData.code,
      expiryDate: couponData.expiryDate
    });
  }

  async sendSpecialEventEmail(user, eventData) {
    return this.sendEmail(user.email, 'specialEvent', {
      name: user.name,
      eventName: eventData.name,
      eventDescription: eventData.description,
      eventDates: eventData.dates,
      pointMultiplier: eventData.pointMultiplier,
      bonusPoints: eventData.bonusPoints,
      minimumPurchase: eventData.minimumPurchase
    });
  }

  async sendBirthdayRewardEmail(user, rewardData) {
    return this.sendEmail(user.email, 'birthdayReward', {
      name: user.name,
      birthdayPoints: rewardData.points,
      specialCoupon: rewardData.couponCode
    });
  }
  
  // Order-related Methods
  async sendOrderConfirmationEmail(user, orderData) {
    return this.sendEmail(user.email, 'orderConfirmation', {
      customerName: user.name,
      ...orderData
    });
  }
  
  async sendOrderUpdateEmail(user, orderData) {
    return this.sendEmail(user.email, 'orderUpdate', orderData);
  }
  
  // Account-related Methods
  async sendPasswordResetEmail(user, resetData) {
    return this.sendEmail(user.email, 'passwordReset', {
      name: user.name || user.email,
      ...resetData
    });
  }
  
  async sendAdminWelcomeEmail(email, verificationToken) {
    return this.sendEmail(email, 'adminWelcome', {
      email,
      verificationToken
    });
  }
  
  // Prescription-related Methods
  async sendPrescriptionStatusEmail(user, prescriptionData) {
    // Use the React Email template for better rendering in modern clients
    return this.sendEmail(user.email, 'reactPrescriptionStatus', {
      name: user.name || user.email,
      ...prescriptionData
    });
  }

  // Additional Methods
  async sendVerificationEmail(to, token, name = '') {
    return this.sendEmail(to, 'verificationEmail', {
      token,
      name
    });
  }

  async sendRefundConfirmationEmail(user, refundData) {
    return this.sendEmail(user.email, 'refundConfirmation', {
      name: user.name,
      ...refundData
    });
  }

  async sendDeliveryConfirmationEmail(user, deliveryData) {
    return this.sendEmail(user.email, 'deliveryConfirmation', {
      customerName: user.name,
      ...deliveryData
    });
  }

  /**
   * Check if a template exists
   */
  hasTemplate(templateName) {
    return !!emailTemplates[templateName];
  }

  /**
   * Get all available template names
   * @returns {Array} Array of template names
   */
  getTemplateNames() {
    return Object.keys(emailTemplates);
  }

  /**
   * Send a test email for template verification
   */
  async sendTestEmail(to, templateName, testData) {
    try {
      // Skip rate limiting for test emails
      if (!this.hasTemplate(templateName)) {
        const error = new Error(`Invalid template name: ${templateName}`);
        emailMonitoring.recordEmailFailed(templateName, to, error, { reason: 'test_invalid_template' });
        throw error;
      }

      const { subject, html } = emailTemplates[templateName](testData);

      // Generate a test email ID
      const emailId = createHash('sha256').update(`test-${to}-${Date.now()}`).digest('hex');
      
      const mailOptions = {
        from: emailConfig.defaults.from,
        to,
        subject: `[TEST] ${subject}`,
        html: `
          <div style="background-color: #f8f9fa; padding: 10px; margin-bottom: 20px;">
            <strong>⚠️ This is a test email</strong>
          </div>
          ${html}
        `,
        headers: {
          'Message-ID': `<test-${emailId}@${emailConfig.dkim.domainName}>`,
          'X-Priority': '1',
          'X-Mailer': 'VivaPharmacy-Test-Mailer',
          'X-Test-Email': 'True'
        }
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Test email sent:', info.messageId);
      
      // Record test email in monitoring
      emailMonitoring.recordEmailSent(`test_${templateName}`, to, {
        messageId: info.messageId,
        isTest: true,
        subject: subject
      });
      
      return info;
    } catch (error) {
      console.error('Error sending test email:', error);
      
      // Record test email failure in monitoring
      emailMonitoring.recordEmailFailed(`test_${templateName || 'unknown'}`, to, error, { 
        reason: 'test_sending_error', 
        isTest: true 
      });
      
      throw error;
    }
  }
  
  /**
   * Get current email sending statistics
   */
  getEmailStats() {
    return emailMonitoring.getEmailStats();
  }
  
  /**
   * Reset monitoring statistics
   */
  resetEmailStats() {
    return emailMonitoring.resetStats();
  }

  /**
   * Send an email with raw HTML content, bypassing the template system.
   * @param {string} to - Recipient email address.
   * @param {string} subject - Email subject.
   * @param {string} htmlContent - HTML content of the email.
   * @returns {Promise<object>} Nodemailer info object.
   */
  async sendRawEmail(to, subject, htmlContent) {
    try {
      if (this.checkEmailRateLimit(to)) {
        const error = new Error(`Rate limit exceeded for ${to}. Please try again later.`);
        emailMonitoring.recordEmailFailed('raw/generic', to, error, { reason: 'rate_limit' });
        throw error;
      }

      const emailId = createHash('sha256').update(`${to}${Date.now()}`).digest('hex');
      const secureHeaders = {
        'Message-ID': `<${emailId}@${emailConfig.dkim.domainName}>`,
        'X-Priority': '1',
        'X-Mailer': 'VivaPharmacy-Secure-Mailer',
        'X-Virus-Scanned': 'True',
        'X-Spam-Status': 'Checked'
      };

      const mailOptions = {
        from: emailConfig.defaults.from,
        replyTo: emailConfig.defaults.replyTo,
        to,
        subject,
        html: htmlContent,
        headers: secureHeaders
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      const obscuredEmail = to.substring(0, 3) + '***@' + to.split('@')[1];
      console.log('Raw email sent:', {
        to: obscuredEmail,
        subject: subject,
        messageId: info.messageId,
        timestamp: new Date().toISOString()
      });
      
      emailMonitoring.recordEmailSent('raw/generic', to, {
        messageId: info.messageId,
        subject: subject
      });
      
      return info;
    } catch (error) {
      console.error('Error sending raw email:', error);
      emailMonitoring.recordEmailFailed('raw/generic', to, error, { 
        reason: 'sending_error',
        errorCode: error.code || 'UNKNOWN'
      });
      throw error;
    }
  }
}

// Create and export a singleton instance
export const emailService = new EmailService(); 