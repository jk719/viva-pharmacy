// UPDATED: Tier configuration for the new simplified 3-tier system
// This file exports the new tier colors and icons for the improved loyalty system

// Re-export from the central config to avoid duplication
export { TIER_CONFIG, getTierFromPoints, migrateLegacyTier } from '@/lib/loyalty/tierConfig';

// Tier colors for the new simplified system (with legacy support)
export const TIER_COLORS = {
  // New 3-tier system
  EXPLORER: {
    bg: 'from-amber-400 to-amber-600',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    accent: 'bg-amber-50',
    border: 'border-amber-200'
  },
  ADVENTURER: {
    bg: 'from-blue-400 to-blue-600',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    accent: 'bg-blue-50',
    border: 'border-blue-200'
  },
  CHAMPION: {
    bg: 'from-purple-400 to-purple-600',
    text: 'text-purple-700',
    icon: 'text-purple-600',
    accent: 'bg-purple-50',
    border: 'border-purple-200'
  },
  
  // Legacy tier support (mapped to new colors)
  BRONZE: {
    bg: 'from-amber-400 to-amber-600',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    accent: 'bg-amber-50',
    border: 'border-amber-200'
  },
  SILVER: {
    bg: 'from-blue-400 to-blue-600',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    accent: 'bg-blue-50',
    border: 'border-blue-200'
  },
  GOLD: {
    bg: 'from-blue-400 to-blue-600',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    accent: 'bg-blue-50',
    border: 'border-blue-200'
  },
  PLATINUM: {
    bg: 'from-purple-400 to-purple-600',
    text: 'text-purple-700',
    icon: 'text-purple-600',
    accent: 'bg-purple-50',
    border: 'border-purple-200'
  },
  SAPPHIRE: {
    bg: 'from-purple-400 to-purple-600',
    text: 'text-purple-700',
    icon: 'text-purple-600',
    accent: 'bg-purple-50',
    border: 'border-purple-200'
  },
  DIAMOND: {
    bg: 'from-purple-400 to-purple-600',
    text: 'text-purple-700',
    icon: 'text-purple-600',
    accent: 'bg-purple-50',
    border: 'border-purple-200'
  },
  LEGEND: {
    bg: 'from-purple-400 to-purple-600',
    text: 'text-purple-700',
    icon: 'text-purple-600',
    accent: 'bg-purple-50',
    border: 'border-purple-200'
  }
};

// Tier icons for the system
import { FaCoins, FaStar, FaTrophy, FaCrown, FaGem } from 'react-icons/fa';

export const TIER_ICONS = {
  // New 3-tier system
  EXPLORER: FaCoins,
  ADVENTURER: FaStar,
  CHAMPION: FaTrophy,
  
  // Legacy tier support
  BRONZE: FaCoins,
  SILVER: FaStar,
  GOLD: FaStar,
  PLATINUM: FaTrophy,
  SAPPHIRE: FaTrophy,
  DIAMOND: FaTrophy,
  LEGEND: FaTrophy
}; 