import Queue from 'bull';
import { emailService } from './emailService';

const emailQueue = new Queue('email-queue', process.env.REDIS_URL);

emailQueue.process(async (job) => {
  const { type, user, data } = job.data;
  
  try {
    switch (type) {
      case 'POINTS_EARNED':
        await emailService.sendPointsEarnedEmail(user, data);
        break;
      case 'TIER_UPGRADE':
        await emailService.sendTierUpgradeEmail(user, data);
        break;
      case 'NEW_COUPON':
        await emailService.sendNewCouponEmail(user, data);
        break;
      case 'SPECIAL_EVENT':
        await emailService.sendSpecialEventEmail(user, data);
        break;
      case 'BIRTHDAY_REWARD':
        await emailService.sendBirthdayRewardEmail(user, data);
        break;
      default:
        throw new Error('Invalid email type');
    }
  } catch (error) {
    console.error('Error processing email job:', error);
    throw error;
  }
});

export const addToEmailQueue = async (type, user, data) => {
  try {
    await emailQueue.add({
      type,
      user,
      data
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
  } catch (error) {
    console.error('Error adding to email queue:', error);
    throw error;
  }
};

export default emailQueue; 