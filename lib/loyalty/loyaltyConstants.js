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

// Colors for tier display
export const TIER_COLORS = {
  BRONZE: {
    primary: '#CD7F32',
    secondary: '#E9C29F',
    background: '#FFF8F0',
    text: 'text-amber-700',
    bg: 'from-amber-100 to-amber-200',
    progressBar: 'from-amber-400 to-amber-500'
  },
  SILVER: {
    primary: '#C0C0C0',
    secondary: '#E0E0E0',
    background: '#F9F9F9',
    text: 'text-gray-500',
    bg: 'from-gray-100 to-gray-300',
    progressBar: 'from-gray-400 to-gray-500'
  },
  GOLD: {
    primary: '#FFD700',
    secondary: '#FFF0A0',
    background: '#FFFAEB',
    text: 'text-amber-500',
    bg: 'from-amber-200 to-amber-300',
    progressBar: 'from-amber-400 to-amber-500'
  },
  PLATINUM: {
    primary: '#B4C7E7',
    secondary: '#D9E1F2',
    background: '#F3F8FF',
    text: 'text-blue-500',
    bg: 'from-blue-100 to-blue-200',
    progressBar: 'from-blue-400 to-blue-500'
  },
  DIAMOND: {
    primary: '#9D90C6',
    secondary: '#C2B7DA',
    background: '#F6F3FD',
    text: 'text-purple-500',
    bg: 'from-purple-100 to-purple-200',
    progressBar: 'from-purple-400 to-purple-500'
  },
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
