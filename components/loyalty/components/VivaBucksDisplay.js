'use client';

import { FaCoins, FaCrown, FaStar } from 'react-icons/fa';
import { memo } from 'react';
import { TIER_COLORS, TIER_ICONS } from '../constants/tierConfig';

/**
 * Displays VivaBucks information with various styling options
 * @param {Object} props Component properties
 * @param {number} props.currentVivaBucks - Available VivaBucks to display
 * @param {number} props.lifetimeVivaBucks - Lifetime VivaBucks earned (optional)
 * @param {string} props.currentTier - User's current tier
 * @param {number} props.multiplier - User's VivaBucks multiplier
 * @param {string} [props.variant="default"] - Display variant ("default", "profile", "card")
 * @param {string} [props.className] - Additional CSS classes
 */
function VivaBucksDisplay({
  currentVivaBucks = 0,
  lifetimeVivaBucks,
  currentTier = 'BRONZE',
  multiplier = 1,
  variant = "default",
  className = ""
}) {
  // Get the correct tier icon
  const TierIcon = TIER_ICONS[currentTier] || TIER_ICONS.BRONZE;
  const tierColor = TIER_COLORS[currentTier]?.text || TIER_COLORS.BRONZE.text;
  
  // Format number with commas
  const formatNumber = (num) => num.toLocaleString();
  
  // Get tier color
  const getTierColor = (tier) => {
    switch (tier.toUpperCase()) {
      case 'SILVER':
        return 'text-gray-400';
      case 'GOLD':
        return 'text-amber-500';
      case 'PLATINUM':
        return 'text-blue-400';
      case 'DIAMOND':
        return 'text-purple-500';
      case 'BRONZE':
      default:
        return 'text-amber-700';
    }
  };
  
  // Get tier background
  const getTierBackground = (tier) => {
    switch (tier.toUpperCase()) {
      case 'SILVER':
        return 'bg-gray-100';
      case 'GOLD':
        return 'bg-amber-50';
      case 'PLATINUM':
        return 'bg-blue-50';
      case 'DIAMOND':
        return 'bg-purple-50';
      case 'BRONZE':
      default:
        return 'bg-amber-50';
    }
  };
  
  const tierBackground = getTierBackground(currentTier);
  
  // Format VivaBucks amount
  const formattedVivaBucks = 
    currentVivaBucks >= 10000 
      ? `${(currentVivaBucks / 1000).toFixed(1)}k` 
      : currentVivaBucks.toLocaleString();
  
  // Render different layouts based on variant
  switch (variant) {
    case "profile":
      return (
        <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 ${className}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center">
                <div className="bg-blue-500/10 p-2 rounded-lg mr-3">
                  <FaCoins className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Current VivaBucks</p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {formattedVivaBucks}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
              <div className="mr-2">
                {TierIcon}
              </div>
              <span className="text-sm font-semibold">{currentTier}</span>
            </div>
          </div>
          
          {lifetimeVivaBucks !== undefined && (
            <div className="mt-2 text-sm text-gray-600">
              Lifetime VivaBucks: {formatNumber(lifetimeVivaBucks)}
            </div>
          )}
        </div>
      );
      
    case "card":
      return (
        <div className={`bg-white rounded-lg p-4 shadow-sm border ${className}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">Available VivaBucks</span>
            <div className="flex items-center">
              <span className={`mr-2 text-sm font-semibold ${tierColor}`}>{currentTier}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-semibold bg-gradient-to-r from-[#FF6B00] to-[#FF9F43]">
                {multiplier}x
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <FaCoins className="h-4 w-4 text-[#FF6B00] mr-2" />
            <span className="text-2xl font-bold">{formattedVivaBucks}</span>
          </div>
          
          {lifetimeVivaBucks !== undefined && (
            <div className="mt-2 text-xs text-gray-500">
              Lifetime VivaBucks: {formatNumber(lifetimeVivaBucks)}
            </div>
          )}
        </div>
      );
      
    default: // Default variant used in banner
      return (
        <div className={`flex items-center space-x-4 ${className}`}>
          <div className="flex-shrink-0">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${TIER_COLORS[currentTier]?.bg || TIER_COLORS.BRONZE.bg} shadow-sm`}>
              <div className="text-white">
                {TierIcon}
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <span className={`text-sm font-semibold ${TIER_COLORS[currentTier]?.text || TIER_COLORS.BRONZE.text}`}>
                {currentTier}
              </span>
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full text-white font-semibold bg-gradient-to-r from-[#FF6B00] to-[#FF9F43]">
                {multiplier}x
              </span>
            </div>
            
            <div className="flex items-center mt-1">
              <FaCoins className="h-3.5 w-3.5 text-[#FF6B00] mr-1.5" />
              <span className="text-base font-bold text-gray-800">{formattedVivaBucks}</span>
              <span className="ml-1.5 text-xs text-gray-500">Available VivaBucks</span>
            </div>
          </div>
        </div>
      );
  }
}

export default memo(VivaBucksDisplay); 