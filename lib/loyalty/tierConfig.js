// New simplified 3-tier system for better user clarity
export const TIER_CONFIG = {
  EXPLORER: {
    points: 0,
    multiplier: 1,
    couponAmount: 0,
    displayName: 'Explorer',
    benefits: [
      'Earn 1x VivaBucks on purchases',
      'Access to member-only promotions',
      'Basic customer support'
    ]
  },
  ADVENTURER: {
    points: 1000,
    multiplier: 1.5,
    couponAmount: 15,
    displayName: 'Adventurer',
    benefits: [
      'Earn 1.5x VivaBucks on purchases',
      'Free shipping on all orders',
      'Priority customer support',
      'Early access to sales'
    ]
  },
  CHAMPION: {
    points: 5000,
    multiplier: 2,
    couponAmount: 50,
    displayName: 'Champion',
    benefits: [
      'Earn 2x VivaBucks on purchases',
      'Free expedited shipping',
      'VIP customer support',
      'Exclusive member perks',
      'Birthday bonuses'
    ]
  }
};

// Legacy tier mapping for backwards compatibility
export const LEGACY_TIER_MAPPING = {
  BRONZE: 'EXPLORER',
  SILVER: 'ADVENTURER', 
  GOLD: 'ADVENTURER',
  PLATINUM: 'CHAMPION',
  SAPPHIRE: 'CHAMPION',
  DIAMOND: 'CHAMPION',
  LEGEND: 'CHAMPION'
};

// Helper function to get tier from points
export const getTierFromPoints = (points) => {
  if (points >= TIER_CONFIG.CHAMPION.points) return 'CHAMPION';
  if (points >= TIER_CONFIG.ADVENTURER.points) return 'ADVENTURER';
  return 'EXPLORER';
};

// Helper function to migrate legacy tier to new tier
export const migrateLegacyTier = (legacyTier) => {
  return LEGACY_TIER_MAPPING[legacyTier] || 'EXPLORER';
}; 