import nodemailer from 'nodemailer';
import { emailConfig } from './config';
import { emailTemplates } from './loyaltyEmailTemplates';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig.smtp);
  }

  async sendEmail(to, templateName, userData) {
    try {
      if (!emailTemplates[templateName]) {
        throw new Error('Email template not found');
      }

      const { subject, html } = emailTemplates[templateName](userData);

      const mailOptions = {
        from: emailConfig.defaults.from,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

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

  hasTemplate(templateName) {
    return templateName in emailTemplates;
  }

  async sendTestEmail(to, templateName, testData) {
    try {
      if (!this.hasTemplate(templateName)) {
        throw new Error('Invalid template name');
      }

      const { subject, html } = emailTemplates[templateName](testData);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: `[TEST] ${subject}`,
        html: `
          <div style="background-color: #f8f9fa; padding: 10px; margin-bottom: 20px;">
            <strong>⚠️ This is a test email</strong>
          </div>
          ${html}
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Test email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService(); 