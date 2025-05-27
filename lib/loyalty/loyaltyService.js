import { emailService } from '../email/emailService';
import User from '@/models/User';
import SpecialEvent from '@/models/SpecialEvent';
import { TIER_CONFIG, getTierFromPoints } from './tierConfig';
import { calculateProgressToNextTier } from './loyaltyCalculator';
import loyaltyEventsService from './eventsService';
import { trackLoyaltyPointsEarned, trackLoyaltyPointsRedeemed } from '@/lib/analytics/events';

export { TIER_CONFIG };

export { getTierFromPoints as calculateTierFromPoints } from './tierConfig';

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
    applicableTiers: user.currentTier || 'EXPLORER'
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
  const tiers = ['EXPLORER', 'ADVENTURER', 'CHAMPION']; // Updated to new 3-tier system
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
};

// Add similar functions for other notifications 

export class LoyaltyService {
  constructor() {
    this.eventsService = loyaltyEventsService;
  }

  async addPoints(userId, points, source) {
    try {
      // Check if this is a duplicate transaction by source ID (if provided)
      if (source && source.includes('order_') && points > 0) {
        const orderId = source.split('order_')[1];
        
        // Check if we've already processed points for this order
        const user = await User.findById(userId);
        if (user && user.rewardHistory) {
          const alreadyProcessed = user.rewardHistory.some(record => 
            record.source === 'purchase' && 
            record.orderId === orderId
          );
          
          if (alreadyProcessed) {
            console.log('🚫 Prevented duplicate points for order:', orderId);
            return {
              success: true,
              message: 'Points already added for this order',
              points: 0,
              duplicate: true
            };
          }
        }
      }
      
      // Add points to user's account in database
      // ... existing database update code ...

      // Track points earned
      trackLoyaltyPointsEarned(points);

      // Emit real-time update
      await this.eventsService.emitPointsEarned(userId, points, source);

      return {
        success: true,
        message: 'Points added successfully',
        points
      };
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  async redeemPoints(userId, points, source) {
    try {
      // Validate and redeem points from user's account
      // ... existing validation and database update code ...

      // Track points redeemed
      trackLoyaltyPointsRedeemed(points);

      // Emit real-time update
      await this.eventsService.emitPointsRedeemed(userId, points, source);

      return {
        success: true,
        message: 'Points redeemed successfully',
        points
      };
    } catch (error) {
      console.error('Error redeeming points:', error);
      throw error;
    }
  }

  async updateUserTier(userId, points) {
    try {
      const progress = calculateProgressToNextTier(points, TIER_CONFIG);
      
      // Update user's tier in database
      // ... existing database update code ...

      // Emit tier update event
      await this.eventsService.emitLoyaltyUpdate(userId, {
        type: 'TIER_UPDATE',
        points,
        tierProgress: progress
      });

      return {
        success: true,
        message: 'Tier updated successfully',
        progress
      };
    } catch (error) {
      console.error('Error updating tier:', error);
      throw error;
    }
  }

  async processOrderPoints(userId, order) {
    try {
      const pointsEarned = this.calculateOrderPoints(order);
      
      // IMPORTANT: Use a standardized source format to detect duplicates
      const source = `order_${order.id || order._id}`;
      
      // Add points through the protected addPoints method
      const result = await this.addPoints(userId, pointsEarned, source);
      
      // Only emit an event if points were actually added (not a duplicate)
      if (!result.duplicate) {
        // Emit order points event
        await this.eventsService.emitLoyaltyUpdate(userId, {
          type: 'ORDER_POINTS',
          orderId: order.id || order._id,
          points: pointsEarned,
          orderTotal: order.total
        });
      }

      return {
        success: true,
        message: 'Order points processed successfully',
        pointsEarned
      };
    } catch (error) {
      console.error('Error processing order points:', error);
      throw error;
    }
  }

  calculateOrderPoints(order) {
    // ... existing points calculation logic ...
    return Math.floor(order.total * 10); // Example: 10 points per dollar
  }
}

// Create singleton instance
const loyaltyService = new LoyaltyService();
export default loyaltyService; 