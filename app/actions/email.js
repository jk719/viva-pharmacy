"use server";

import { addToEmailQueue, EMAIL_TYPES } from "@/lib/email/emailQueue";
import { emailService } from '@/lib/email/emailService';

/**
 * Server action to send emails via the queue system
 * 
 * @param {string} type - Email type from EMAIL_TYPES
 * @param {object} userData - User data including email
 * @param {object} emailData - Data specific to the email template
 * @returns {object} Result of the operation
 */
export async function sendQueuedEmail(type, userData, emailData) {
  try {
    // Validate inputs
    if (!userData?.email) {
      return { success: false, error: "User email is required" };
    }

    if (!Object.values(EMAIL_TYPES).includes(type)) {
      return { success: false, error: `Invalid email type: ${type}` };
    }

    // Add to the queue
    await addToEmailQueue(type, userData, emailData);
    return { success: true };
  } catch (error) {
    console.error('Error sending queued email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a loyalty program email via the queue
 */
export async function sendLoyaltyEmail(type, userData, additionalData) {
  try {
    // Map to the correct queue type
    let queueType;
    switch (type) {
      case 'points-earned':
        queueType = EMAIL_TYPES.POINTS_EARNED;
        break;
      case 'tier-upgrade':
        queueType = EMAIL_TYPES.TIER_UPGRADE;
        break;
      case 'new-coupon':
        queueType = EMAIL_TYPES.NEW_COUPON;
        break;
      case 'special-event':
        queueType = EMAIL_TYPES.SPECIAL_EVENT;
        break;
      case 'birthday-reward':
        queueType = EMAIL_TYPES.BIRTHDAY_REWARD;
        break;
      default:
        throw new Error(`Unknown loyalty email type: ${type}`);
    }
    
    return sendQueuedEmail(queueType, userData, additionalData);
  } catch (error) {
    console.error('Error sending loyalty email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a generic email directly using emailService
 * For use in migrating from emailAdapter to direct server actions
 * 
 * @param {FormData} formData - Contains recipient, subject, and content
 * @returns {Object} Response with success status
 */
export async function sendGenericEmail(formData) {
  try {
    const to = formData.get('to');
    const subject = formData.get('subject');
    const content = formData.get('content');
    
    if (!to || !subject || !content) {
      return {
        success: false,
        message: 'Missing required fields: to, subject, or content',
        status: 400
      };
    }

    await emailService.sendRawEmail(to, subject, content);

    return { 
      success: true, 
      message: 'Email sent successfully',
      status: 200
    };
  } catch (error) {
    console.error('Error sending generic email:', error);
    return {
      success: false,
      message: 'Failed to send email',
      status: 500
    };
  }
} 