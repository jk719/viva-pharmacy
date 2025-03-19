import { EVENT_TYPES } from '@/lib/loyalty/eventsService';
import { eventEmitter, Events } from '@/lib/eventEmitter';

export class LoyaltyCheckoutService {
  static async calculateLoyaltyBenefits(user, orderAmount) {
    try {
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

      const benefits = {
        basePoints: Math.floor(pointsEarned),
        tierMultiplier,
        eventBenefits: {
          finalPoints: Math.floor(eventBenefits.finalPoints),
          appliedEvents: eventBenefits.appliedEvents || [],
          bonusPoints: eventBenefits.bonusPoints || 0
        },
        totalPoints: Math.floor(eventBenefits.finalPoints),
        appliedEvents: eventBenefits.appliedEvents || [],
        currentPoints: (user.vivaBucks || 0) + Math.floor(eventBenefits.finalPoints),
        lifetimePoints: (user.cumulativePoints || 0) + Math.floor(eventBenefits.finalPoints),
        currentTier: user.currentTier || 'BRONZE'
      };

      return benefits;
    } catch (error) {
      console.error('Error calculating loyalty benefits:', error);
      const basePoints = Math.floor(orderAmount * 10);
      return {
        basePoints,
        tierMultiplier: 1,
        eventBenefits: { 
          finalPoints: basePoints,
          appliedEvents: [],
          bonusPoints: 0
        },
        totalPoints: basePoints,
        appliedEvents: [],
        currentPoints: (user.vivaBucks || 0) + basePoints,
        lifetimePoints: (user.cumulativePoints || 0) + basePoints,
        currentTier: user.currentTier || 'BRONZE'
      };
    }
  }

  static calculateBasePoints(amount) {
    return Math.floor(amount * 10);
  }

  static async getActiveEvents() {
    try {
      const response = await fetch('/api/loyalty/active-events');
      if (!response.ok) {
        console.error('Failed to fetch active events:', response.status);
        return [];
      }
      const data = await response.json();
      return Array.isArray(data.events) ? data.events : [];
    } catch (error) {
      console.error('Error fetching active events:', error);
      return [];
    }
  }

  static async calculateEventBenefits(events, user, amount, basePoints) {
    try {
      let finalPoints = basePoints;
      const appliedEvents = [];
      let bonusPoints = 0;

      if (!Array.isArray(events) || events.length === 0) {
        return { finalPoints, appliedEvents, bonusPoints };
      }

      for (const event of events) {
        if (event.type === 'MULTIPLIER' && event.pointMultiplier > 1) {
          const eventBonus = Math.floor(basePoints * (event.pointMultiplier - 1));
          bonusPoints += eventBonus;
          finalPoints += eventBonus;
          appliedEvents.push({
            eventId: event._id,
            name: event.name,
            multiplier: event.pointMultiplier,
            bonusPoints: eventBonus
          });
        } else if (event.type === 'FIXED_BONUS' && amount >= (event.minimumPurchase || 0)) {
          bonusPoints += event.bonusPoints;
          finalPoints += event.bonusPoints;
          appliedEvents.push({
            eventId: event._id,
            name: event.name,
            multiplier: 1,
            bonusPoints: event.bonusPoints
          });
        }
      }

      return {
        finalPoints: Math.floor(finalPoints),
        appliedEvents,
        bonusPoints: Math.floor(bonusPoints)
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
} 