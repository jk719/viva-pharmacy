import { EVENT_TYPES } from '@/lib/loyalty/eventsService';
import SpecialEvent from '@/models/SpecialEvent';
import dbConnect from '@/lib/dbConnect';
import loyaltyEventsService from '@/lib/loyalty/eventsService';

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

      // Return result without emitting events
      return {
        basePoints: Math.floor(pointsEarned),
        tierMultiplier,
        eventBenefits,
        totalPoints: Math.floor(eventBenefits.finalPoints),
        appliedEvents: eventBenefits.appliedEvents,
        orderAmount,
        calculationSteps: eventBenefits.calculationSteps || []
      };
    } catch (error) {
      console.error('Error calculating loyalty benefits:', error);
      
      // Return fallback result without emitting events
      return {
        basePoints: Math.floor(orderAmount * 10),
        tierMultiplier: 1,
        eventBenefits: { bonusPoints: 0, finalPoints: Math.floor(orderAmount * 10) },
        totalPoints: Math.floor(orderAmount * 10),
        appliedEvents: [],
        calculationSteps: [{
          step: 'ERROR',
          error: error.message
        }],
        error: error.message
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
      const calculationSteps = [];

      // Ensure events is iterable
      if (!Array.isArray(events)) {
        console.warn('Events is not an array:', events);
        return {
          finalPoints: basePoints,
          appliedEvents: [],
          bonusPoints: 0,
          calculationSteps: [{
            step: 'VALIDATION_ERROR',
            message: 'Invalid events array'
          }]
        };
      }

      for (const event of events) {
        // Skip invalid events
        if (!event || !event.type) continue;

        // Track each step of the calculation
        const step = {
          eventId: event._id,
          eventName: event.name,
          eventType: event.type,
          initialPoints: finalPoints,
        };

        // Convert user's tier to match event tier format if needed
        const userTier = user.currentTier || 'BRONZE';
        
        // Check if user's tier is eligible
        if (event.applicableTiers && 
            !event.applicableTiers.includes(userTier)) {
          step.status = 'SKIPPED';
          step.reason = 'TIER_INELIGIBLE';
          calculationSteps.push(step);
          continue;
        }

        // Check minimum purchase requirement
        if (event.minimumPurchase && amount < event.minimumPurchase) {
          step.status = 'SKIPPED';
          step.reason = 'MINIMUM_PURCHASE_NOT_MET';
          calculationSteps.push(step);
          continue;
        }

        let eventBonus = 0;
        let eventMultiplier = 1;

        switch (event.type) {
          case EVENT_TYPES.PROMOTION:
          case EVENT_TYPES.FLASH_SALE:
            eventMultiplier = event.pointMultiplier || 1;
            eventBonus = event.bonusPoints || 0;
            break;
          
          case EVENT_TYPES.BIRTHDAY:
            if (this.isUserBirthday(user)) {
              eventMultiplier = event.pointMultiplier || 1;
              eventBonus = event.bonusPoints || 0;
            } else {
              step.status = 'SKIPPED';
              step.reason = 'NOT_BIRTHDAY';
              calculationSteps.push(step);
              continue;
            }
            break;

          case EVENT_TYPES.HOLIDAY:
            eventMultiplier = event.pointMultiplier || 1;
            eventBonus = event.bonusPoints || 0;
            break;
        }

        const pointsBeforeMultiplier = finalPoints;
        finalPoints *= eventMultiplier;
        bonusPoints += eventBonus;

        step.status = 'APPLIED';
        step.multiplier = eventMultiplier;
        step.bonusPoints = eventBonus;
        step.pointsBeforeMultiplier = pointsBeforeMultiplier;
        step.pointsAfterMultiplier = finalPoints;
        step.finalPointsWithBonus = finalPoints + eventBonus;
        calculationSteps.push(step);

        appliedEvents.push({
          eventId: event._id,
          name: event.name,
          type: event.type,
          multiplier: eventMultiplier,
          bonusPoints: eventBonus,
          basePoints: basePoints,
          finalPoints: finalPoints
        });
      }

      finalPoints = Math.floor(finalPoints + bonusPoints);

      return {
        finalPoints,
        appliedEvents,
        bonusPoints,
        calculationSteps
      };
    } catch (error) {
      console.error('Error calculating event benefits:', error);
      return {
        finalPoints: basePoints,
        appliedEvents: [],
        bonusPoints: 0,
        calculationSteps: [{
          step: 'CALCULATION_ERROR',
          error: error.message
        }]
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