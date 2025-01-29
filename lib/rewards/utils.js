import { REWARD_CONSTANTS } from './constants.js';

export const RewardsUtils = {
  getRewardAmount(points) {
    return Math.floor(points / REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED) 
           * REWARD_CONSTANTS.REWARD_RATE.REWARD_AMOUNT;
  },

  getPointsToNextReward(points) {
    return REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED - 
           (points % REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED);
  },

  getMembershipTier(points) {
    return Object.values(REWARD_CONSTANTS.MEMBERSHIP_TIERS)
      .reverse()
      .find(tier => points >= tier.minPoints);
  },

  calculatePointsEarned(amount, tierMultiplier) {
    return Math.floor(amount * REWARD_CONSTANTS.POINTS_PER_DOLLAR * tierMultiplier);
  },

  formatPoints(points) {
    return Math.floor(points).toLocaleString();
  },

  formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
  },

  getProgressToNextTier(points) {
    const currentTier = this.getMembershipTier(points);
    const tiers = Object.values(REWARD_CONSTANTS.MEMBERSHIP_TIERS)
      .sort((a, b) => a.minPoints - b.minPoints);
    const nextTier = tiers.find(tier => tier.minPoints > points);

    if (!nextTier) {
      return {
        current: currentTier.name,
        next: null,
        pointsNeeded: 0,
        progress: 100
      };
    }

    const pointsNeeded = nextTier.minPoints - points;
    const progress = ((points - currentTier.minPoints) / 
                     (nextTier.minPoints - currentTier.minPoints)) * 100;

    return {
      current: currentTier.name,
      next: nextTier.name,
      pointsNeeded,
      progress: Math.min(Math.max(progress, 0), 100)
    };
  },

  calculateProgress(points) {
    const currentPoints = Math.floor(points || 0);
    return {
      currentPoints,
      availableReward: this.getRewardAmount(currentPoints),
      progress: (currentPoints % REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED) / 
                REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED * 100,
      currentProgressPoints: currentPoints % REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED,
      pointsToNextReward: this.getPointsToNextReward(currentPoints),
      pointsNeeded: REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED
    };
  }
}; 