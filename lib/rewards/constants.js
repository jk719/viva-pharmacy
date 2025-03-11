export const REWARD_CONSTANTS = {
  WELCOME_BONUS: {
    VIVABUCKS: 100,
    POINTS: 100
  },
  
  POINTS_PER_DOLLAR: 1,
  
  REWARD_RATE: {
    POINTS_NEEDED: 100,
    REWARD_AMOUNT: 10
  },
  
  MAX_MILESTONE: 1000,
  BONUS_POINTS: 100,
  
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
  
  BONUSES: {
    FIRST_PURCHASE: 100,
    BIRTHDAY: 50,
    REFERRAL: 200,
    REVIEW: 25
  },
  
  TIER_MULTIPLIERS: {
    STANDARD: 1,
    SILVER: 1.25,
    GOLD: 1.5,
    PLATINUM: 2
  }
}; 