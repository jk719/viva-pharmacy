import { emailService } from '../email/emailService';
import User from '@/models/User';
import SpecialEvent from '@/models/SpecialEvent';
import { TIER_CONFIG } from './tierConfig';

export { TIER_CONFIG };

export const calculateTierFromPoints = (points) => {
  if (points >= TIER_CONFIG.LEGEND.points) return 'LEGEND';
  if (points >= TIER_CONFIG.DIAMOND.points) return 'DIAMOND';
  if (points >= TIER_CONFIG.SAPPHIRE.points) return 'SAPPHIRE';
  if (points >= TIER_CONFIG.PLATINUM.points) return 'PLATINUM';
  if (points >= TIER_CONFIG.GOLD.points) return 'GOLD';
  if (points >= TIER_CONFIG.SILVER.points) return 'SILVER';
  return 'BRONZE'; // Default tier
};

export const generateCouponCode = () => {
  return `VIVA${Date.now()}${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
};

export const processEventMultipliers = async (userId, basePoints) => {
  const user = await User.findById(userId);
  if (!user) return basePoints;

  const now = new Date();
  const activeEvents = await SpecialEvent.find({
    startDate: { $lte: now },
    endDate: { $gte: now },
    isActive: true,
    applicableTiers: user.currentTier || 'BRONZE'
  });

  const maxMultiplier = activeEvents.reduce(
    (max, event) => Math.max(max, event.pointMultiplier || 1),
    1
  );

  return {
    points: Math.floor(basePoints * maxMultiplier),
    appliedEvents: activeEvents.map(event => ({
      eventId: event._id,
      name: event.name,
      multiplier: event.pointMultiplier,
      bonusPoints: 0
    }))
  };
};

export const calculatePointsForPurchase = async (amount, userId) => {
  const user = await User.findById(userId);
  if (!user) return { points: 0, appliedEvents: [] };

  const basePoints = Math.floor(amount * 10 * (user.pointsMultiplier || 1));
  return processEventMultipliers(userId, basePoints);
};

export const processPointsEarned = async (user, points, orderId) => {
  try {
    // Send email notification directly
    await emailService.sendPointsEarnedEmail(user, {
      earned: points,
      total: user.vivaBucks,
      tier: user.currentTier,
      nextTierProgress: calculateNextTierProgress(user.cumulativePoints),
      nextTier: calculateNextTier(user.currentTier)
    });
  } catch (error) {
    console.error('Error sending points earned email:', error);
    // Continue execution even if email fails
  }
};

export const processTierUpgrade = async (user, newTier) => {
  try {
    // Send email notification directly
    await emailService.sendTierUpgradeEmail(user, {
      newTier: newTier,
      benefits: TIER_CONFIG[newTier]
    });
  } catch (error) {
    console.error('Error sending tier upgrade email:', error);
    // Continue execution even if email fails
  }
};

// Helper functions
const calculateNextTierProgress = (currentPoints) => {
  const tiers = Object.entries(TIER_CONFIG).sort((a, b) => a[1].points - b[1].points);
  for (const [tier, config] of tiers) {
    if (config.points > currentPoints) {
      return {
        nextTierPoints: config.points,
        remaining: config.points - currentPoints
      };
    }
  }
  return null; // Already at highest tier
};

const calculateNextTier = (currentTier) => {
  const tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'SAPPHIRE', 'DIAMOND', 'LEGEND'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
};

// Add similar functions for other notifications 