import { EVENT_TYPES } from '@/lib/loyalty/eventsService';
import SpecialEvent from '@/models/SpecialEvent';
import dbConnect from '@/lib/dbConnect';

export class LoyaltyCheckoutService {
  static async calculateLoyaltyBenefits(user, orderAmount) {
    try {
      await dbConnect();
      const activeEvents = await this.getActiveEvents();
      let pointsEarned = this.calculateBasePoints(orderAmount);
      const tierMultiplier = user.pointsMultiplier || 1;
      pointsEarned *= tierMultiplier;

      const eventBenefits = await this.calculateEventBenefits(
        activeEvents,
        user,
        orderAmount,
        pointsEarned
      );

      return {
        basePoints: Math.floor(pointsEarned),
        tierMultiplier,
        eventBenefits,
        totalPoints: Math.floor(eventBenefits.finalPoints),
        appliedEvents: eventBenefits.appliedEvents
      };
    } catch (error) {
      console.error('Error calculating loyalty benefits:', error);
      return {
        basePoints: Math.floor(orderAmount * 10),
        tierMultiplier: 1,
        eventBenefits: { bonusPoints: 0, finalPoints: Math.floor(orderAmount * 10) },
        totalPoints: Math.floor(orderAmount * 10),
        appliedEvents: []
      };
    }
  }

  static calculateBasePoints(amount) {
    // Base conversion: $1 = 10 points
    return Math.floor(amount * 10);
  }

  static async getActiveEvents() {
    try {
      const now = new Date();
      const activeEvents = await SpecialEvent.find({
        startDate: { $lte: now },
        endDate: { $gte: now },
        isActive: true
      }).lean();
      return activeEvents || [];
    } catch (error) {
      console.error('Error fetching active events:', error);
      return [];
    }
  }

  static async calculateEventBenefits(events = [], user, amount, basePoints) {
    try {
      let finalPoints = basePoints;
      const appliedEvents = [];
      let bonusPoints = 0;

      // Ensure events is iterable
      if (!Array.isArray(events)) {
        console.warn('Events is not an array:', events);
        return {
          finalPoints: basePoints,
          appliedEvents: [],
          bonusPoints: 0
        };
      }

      for (const event of events) {
        // Skip invalid events
        if (!event || !event.type) continue;

        // Convert user's tier to match event tier format if needed
        const userTier = user.currentTier || 'BRONZE';
        
        // Check if user's tier is eligible
        if (event.applicableTiers && 
            !event.applicableTiers.includes(userTier)) {
          continue;
        }

        // Check minimum purchase requirement
        if (event.minimumPurchase && amount < event.minimumPurchase) {
          continue;
        }

        switch (event.type) {
          case EVENT_TYPES.PROMOTION:
          case EVENT_TYPES.FLASH_SALE:
            finalPoints *= (event.pointMultiplier || 1);
            bonusPoints += (event.bonusPoints || 0);
            break;
          
          case EVENT_TYPES.BIRTHDAY:
            if (this.isUserBirthday(user)) {
              finalPoints *= (event.pointMultiplier || 1);
              bonusPoints += (event.bonusPoints || 0);
            }
            break;

          case EVENT_TYPES.HOLIDAY:
            finalPoints *= (event.pointMultiplier || 1);
            bonusPoints += (event.bonusPoints || 0);
            break;
        }

        appliedEvents.push({
          eventId: event._id,
          name: event.name,
          multiplier: event.pointMultiplier || 1,
          bonusPoints: event.bonusPoints || 0
        });
      }

      finalPoints = Math.floor(finalPoints + bonusPoints);

      return {
        finalPoints,
        appliedEvents,
        bonusPoints
      };
    } catch (error) {
      console.error('Error calculating event benefits:', error);
      return {
        finalPoints: basePoints,
        appliedEvents: [],
        bonusPoints: 0
      };
    }
  }

  static isUserBirthday(user) {
    if (!user.birthday) return false;
    
    const today = new Date();
    const birthday = new Date(user.birthday);
    return today.getMonth() === birthday.getMonth() && 
           today.getDate() === birthday.getDate();
  }
} 