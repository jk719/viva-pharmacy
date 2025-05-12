/**
 * Email Queue System
 * 
 * This module provides a Redis-backed queue for sending emails asynchronously,
 * which improves application performance by offloading email sending.
 */

import Queue from 'bull';
import { emailService } from './emailService';
import emailConfig from './config';

// Define all supported email types
export const EMAIL_TYPES = {
  // Loyalty program emails
  POINTS_EARNED: 'POINTS_EARNED',
  TIER_UPGRADE: 'TIER_UPGRADE',
  NEW_COUPON: 'NEW_COUPON',
  SPECIAL_EVENT: 'SPECIAL_EVENT',
  BIRTHDAY_REWARD: 'BIRTHDAY_REWARD',
  
  // Order-related emails
  ORDER_CONFIRMATION: 'ORDER_CONFIRMATION',
  ORDER_UPDATE: 'ORDER_UPDATE',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  REFUND_CONFIRMATION: 'REFUND_CONFIRMATION',
  DELIVERY_CONFIRMATION: 'DELIVERY_CONFIRMATION',
  
  // Account-related emails
  PASSWORD_RESET: 'PASSWORD_RESET',
  ADMIN_WELCOME: 'ADMIN_WELCOME',
  VERIFICATION_EMAIL: 'VERIFICATION_EMAIL',
  
  // Prescription-related emails
  PRESCRIPTION_STATUS: 'PRESCRIPTION_STATUS'
};

// Create the email queue with Redis connection
const emailQueue = new Queue('email-queue', process.env.REDIS_URL || 'redis://localhost:6379');

// Configure queue settings
emailQueue.on('error', (error) => {
  console.error('Email queue error:', error);
});

emailQueue.on('failed', (job, error) => {
  console.error(`Email job ${job.id} failed:`, error);
});

// Process email jobs
emailQueue.process(async (job) => {
  const { type, user, data } = job.data;
  
  try {
    console.log(`Processing email job ${job.id} of type ${type}`);
    
    switch (type) {
      // Loyalty program emails
      case EMAIL_TYPES.POINTS_EARNED:
        await emailService.sendPointsEarnedEmail(user, data);
        break;
      case EMAIL_TYPES.TIER_UPGRADE:
        await emailService.sendTierUpgradeEmail(user, data);
        break;
      case EMAIL_TYPES.NEW_COUPON:
        await emailService.sendNewCouponEmail(user, data);
        break;
      case EMAIL_TYPES.SPECIAL_EVENT:
        await emailService.sendSpecialEventEmail(user, data);
        break;
      case EMAIL_TYPES.BIRTHDAY_REWARD:
        await emailService.sendBirthdayRewardEmail(user, data);
        break;
        
      // Order-related emails
      case EMAIL_TYPES.ORDER_CONFIRMATION:
        await emailService.sendOrderConfirmationEmail(user, data);
        break;
      case EMAIL_TYPES.ORDER_UPDATE:
        await emailService.sendOrderUpdateEmail(user, data);
        break;
      case EMAIL_TYPES.REFUND_CONFIRMATION:
        await emailService.sendRefundConfirmationEmail(user, data);
        break;
      case EMAIL_TYPES.DELIVERY_CONFIRMATION:
        await emailService.sendDeliveryConfirmationEmail(user, data);
        break;
        
      // Account-related emails
      case EMAIL_TYPES.PASSWORD_RESET:
        await emailService.sendPasswordResetEmail(user, data);
        break;
      case EMAIL_TYPES.ADMIN_WELCOME:
        await emailService.sendAdminWelcomeEmail(user.email, data.verificationToken);
        break;
      case EMAIL_TYPES.VERIFICATION_EMAIL:
        await emailService.sendVerificationEmail(user.email, data.token, user.name);
        break;
        
      // Prescription-related emails
      case EMAIL_TYPES.PRESCRIPTION_STATUS:
        await emailService.sendPrescriptionStatusEmail(user, data);
        break;
      
      // Add case for ORDER_CANCELLED
      case EMAIL_TYPES.ORDER_CANCELLED:
        // TODO: Implement sendOrderCancelledEmail in emailService and the corresponding template
        console.error(`Email type ${type} (ORDER_CANCELLED) not fully implemented. Job ${job.id} will not be processed.`);
        // Optionally, throw an error to mark the job as failed if that's preferred:
        // throw new Error(`Email type ${type} (ORDER_CANCELLED) not implemented.`);
        break;

      default:
        throw new Error(`Invalid email type: ${type}`);
    }
    
    console.log(`Email job ${job.id} completed successfully`);
  } catch (error) {
    console.error(`Error processing email job ${job.id}:`, error);
    throw error;
  }
});

/**
 * Add an email job to the queue
 * 
 * @param {string} type - The type of email to send (from EMAIL_TYPES)
 * @param {object} user - The user object (must include email)
 * @param {object} data - The data required for the email template
 * @param {object} options - Optional queue configuration
 * @returns {Promise<Job>} The created job
 */
export const addToEmailQueue = async (type, user, data, options = {}) => {
  try {
    // Validate inputs
    if (!type || !Object.values(EMAIL_TYPES).includes(type)) {
      throw new Error(`Invalid email type: ${type}`);
    }
    
    if (!user || !user.email) {
      throw new Error('User object must include an email address');
    }
    
    // Set default options if not provided
    const queueOptions = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      ...options
    };
    
    // Add job to queue
    const job = await emailQueue.add({
      type,
      user,
      data
    }, queueOptions);
    
    console.log(`Added ${type} email to queue with job ID ${job.id}`);
    return job;
  } catch (error) {
    console.error('Error adding to email queue:', error);
    throw error;
  }
};

// Expose queue for admin monitoring
export default emailQueue; 