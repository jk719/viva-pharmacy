export const REWARDS_CONFIG = {
  // Basic Point Earning
  POINTS_PER_DOLLAR: 1,    // Simple $1 = 1 point

  // Reward Redemption
  REWARD_RATE: {
    POINTS_NEEDED: 100,    // Every 100 points
    REWARD_AMOUNT: 10      // = $10 reward
  },

  // Constants for reward system
  MAX_MILESTONE: 1000,
  BONUS_POINTS: 100,

  // Membership Tiers
  MEMBERSHIP_TIERS: {
    STANDARD: {
      name: "STANDARD",
      minPoints: 0,
      multiplier: 1.0,
      color: 'text-gray-500'
    },
    SILVER: {
      name: "SILVER",
      minPoints: 1000,
      multiplier: 1.1,
      color: 'text-gray-400'
    },
    GOLD: {
      name: "GOLD",
      minPoints: 2500,
      multiplier: 1.2,
      color: 'text-yellow-500'
    },
    PLATINUM: {
      name: "PLATINUM",
      minPoints: 5000,
      multiplier: 1.3,
      color: 'text-purple-500'
    }
  },

  // Bonus Points
  BONUSES: {
    FIRST_PURCHASE: 100,
    BIRTHDAY: 50,
    REFERRAL: 200,
    REVIEW: 25
  },

  // Helper functions
  getRewardAmount: function(points) {
    return Math.floor(points / this.REWARD_RATE.POINTS_NEEDED) * this.REWARD_RATE.REWARD_AMOUNT;
  },

  getPointsToNextReward: function(points) {
    return this.REWARD_RATE.POINTS_NEEDED - (points % this.REWARD_RATE.POINTS_NEEDED);
  },

  getMembershipTier: function(points) {
    return Object.values(this.MEMBERSHIP_TIERS)
      .reverse()
      .find(tier => points >= tier.minPoints);
  },

  calculatePointsEarned: function(amount, tierMultiplier) {
    return Math.floor(amount * this.POINTS_PER_DOLLAR * tierMultiplier);
  },

  // New helper functions
  formatPoints: function(points) {
    return points.toLocaleString();
  },

  formatCurrency: function(amount) {
    return `$${amount.toFixed(2)}`;
  },

  getProgressToNextTier: function(points) {
    const currentTier = this.getMembershipTier(points);
    const tiers = Object.values(this.MEMBERSHIP_TIERS).sort((a, b) => a.minPoints - b.minPoints);
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
    const progress = ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100;

    return {
      current: currentTier.name,
      next: nextTier.name,
      pointsNeeded,
      progress: Math.min(Math.max(progress, 0), 100)
    };
  }
};
