/**
 * Loyalty system constants
 * Centralizing all constants used across the loyalty system
 */

// Tier thresholds for the standard tiers
export const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
  PLATINUM: 15000,
  DIAMOND: 50000,
};

// Multipliers for each tier
export const TIER_MULTIPLIERS = {
  BRONZE: 1,
  SILVER: 1.25,
  GOLD: 1.5,
  PLATINUM: 1.75,
  DIAMOND: 2,
};

// Display names for tiers
export const TIER_NAMES = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
  DIAMOND: 'Diamond',
};

// Benefits for each tier
export const TIER_BENEFITS = {
  BRONZE: [
    'Earn 1x VivaBucks on all purchases',
    'Access to exclusive promotions',
    'Ability to redeem VivaBucks for discounts'
  ],
  SILVER: [
    'Earn 1.25x VivaBucks on all purchases',
    'Free standard shipping on orders over $35',
    'Early access to new products',
    'All Bronze tier benefits'
  ],
  GOLD: [
    'Earn 1.5x VivaBucks on all purchases',
    'Free standard shipping on all orders',
    'Priority customer support',
    'Exclusive seasonal gifts',
    'All Silver tier benefits'
  ],
  PLATINUM: [
    'Earn 1.75x VivaBucks on all purchases',
    'Free expedited shipping on all orders',
    'Dedicated customer support line',
    'Complimentary product samples with every order',
    'All Gold tier benefits'
  ],
  DIAMOND: [
    'Earn 2x VivaBucks on all purchases',
    'Free overnight shipping on all orders',
    'Personal shopping consultant',
    'Annual birthday gift',
    'Exclusive early access to sales',
    'All Platinum tier benefits'
  ],
};

// Constants for extended tiers (above Diamond)
export const EXTENDED_TIER_BASE_VIVABUCKS = 100000;
export const EXTENDED_TIER_STEP_VIVABUCKS = 50000;
export const EXTENDED_TIER_MULTIPLIER = 2.5;

// Transaction types
export const TRANSACTION_TYPES = {
  EARN: 'EARN',
  SPEND: 'SPEND',
  EXPIRE: 'EXPIRE',
  ADJUST: 'ADJUST',
  REFUND: 'REFUND'
};

// Transaction sources
export const TRANSACTION_SOURCES = {
  PURCHASE: 'purchase',
  REFERRAL: 'referral',
  ADMIN: 'admin',
  PROMOTION: 'promotion',
  REFUND: 'refund',
  SYSTEM: 'system',
  REDEMPTION: 'redemption',
  OTHER: 'other'
};

// Base earning rate for VivaBucks (1% by default)
export const BASE_EARN_RATE = 0.01;

// Default animation duration in ms
export const DEFAULT_ANIMATION_DURATION = 1500;
