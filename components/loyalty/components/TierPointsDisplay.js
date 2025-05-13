'use client';

import { FaCoins, FaGift, FaArrowUp } from 'react-icons/fa';
import { IoMdStar } from 'react-icons/io';
import { TIER_COLORS, TIER_ICONS } from '../constants/tierConfig';

// No counter animation component needed anymore - removing

/**
 * Display component for loyalty tier and VivaBucks points information
 */
export default function TierPointsDisplay({
  currentTier = 'BRONZE',
  points = 0,
  multiplier = 1,
  showBadges = true,
  compact = false
}) {
  const tierColors = TIER_COLORS[currentTier] || TIER_COLORS.BRONZE;
  const Icon = TIER_ICONS[currentTier] || TIER_ICONS.BRONZE;
  
  // Apply compact styling
  const containerClasses = compact
    ? "flex items-center space-x-1.5 md:space-x-3 flex-1 z-10"
    : "flex items-center space-x-2 md:space-x-4 flex-1 z-10";
  
  const iconSizeClasses = compact
    ? "w-7 md:w-9 h-7 md:h-9"
    : "w-8 md:w-12 h-8 md:h-12";
  
  const tierNameClasses = compact
    ? "text-xs md:text-xs font-bold tracking-wider uppercase"
    : "text-xs md:text-sm font-bold tracking-wider uppercase";
  
  const multiplierBadgeClasses = compact
    ? "text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded-full text-white font-semibold bg-gradient-to-r from-[#FF6B00] to-[#FF9F43]"
    : "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full text-white font-semibold bg-gradient-to-r from-[#FF6B00] to-[#FF9F43]";
  
  const pointsValueClasses = compact
    ? "text-sm md:text-lg font-extrabold text-gray-800"
    : "text-sm md:text-xl font-extrabold text-gray-800";
  
  const vivaBucksLabelClasses = compact
    ? "text-[7px] md:text-[9px] text-gray-500"
    : "text-[8px] md:text-xs text-gray-500";
  
  const badgeIconClasses = compact
    ? "h-1.5 md:h-1.5 w-1.5 md:w-1.5 mr-0.5"
    : "h-1.5 md:h-2 w-1.5 md:w-2 mr-0.5";
  
  const badgeClasses = compact
    ? "text-[5px] md:text-[7px] px-1 md:px-1 py-0.5 rounded-full text-white font-medium flex items-center"
    : "text-[6px] md:text-[8px] px-1 md:px-1.5 py-0.5 rounded-full text-white font-medium flex items-center";
  
  return (
    <div className={containerClasses} data-testid="tier-points-display">
      {/* Tier icon */}
      <div 
        className={`flex items-center justify-center ${iconSizeClasses} rounded-full relative shadow-sm`}
        data-testid="tier-icon-container"
      >
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${tierColors?.bg || 'from-gray-100 to-gray-300'} opacity-60`} 
        />
        <div 
          className={`relative z-20 ${compact ? 'scale-75 md:scale-90' : 'scale-90 md:scale-110'} ${tierColors?.icon || 'text-gray-600'}`}
        >
          {Icon}
        </div>
      </div>

      {/* Tier and points info */}
      <div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <h3 
            className={`${tierNameClasses} ${tierColors?.text || 'text-gray-700'}`}
            data-testid="tier-name"
          >
            {currentTier}
          </h3>
          <span 
            className={multiplierBadgeClasses}
            data-testid="multiplier-badge"
          >
            {multiplier}x
          </span>
        </div>

        {/* Points display - simplified */}
        <div className="flex items-baseline space-x-1 md:space-x-2 mt-0.5">
          <div className="flex items-center">
            <div className="relative mr-1 md:mr-1.5">
              <FaCoins 
                className={`h-2.5 md:h-3 w-2.5 md:w-3 text-[#FF6B00]`}
                aria-hidden="true"
              />
            </div>
            <span 
              className={pointsValueClasses}
              data-testid="points-value"
            >
              {points.toLocaleString()}
            </span>
          </div>
          <span className={vivaBucksLabelClasses}>
            VivaBucks
          </span>
        </div>

        {/* Badges */}
        {showBadges && (
          <div className="flex space-x-1 md:space-x-2 mt-1" data-testid="loyalty-badges">
            {/* First Purchase Badge */}
            <div className={`${badgeClasses} bg-gradient-to-r from-green-400 to-green-500`}>
              <FaGift className={badgeIconClasses} aria-hidden="true" />
              <span>First Purchase</span>
            </div>

            {/* Loyal Customer Badge */}
            <div className={`${badgeClasses} bg-gradient-to-r from-blue-400 to-blue-500`}>
              <IoMdStar className={badgeIconClasses} aria-hidden="true" />
              <span>Loyal Customer</span>
            </div>

            {/* Referral Badge */}
            <div className={`${badgeClasses} bg-gradient-to-r from-purple-400 to-purple-500`}>
              <FaArrowUp className={badgeIconClasses} aria-hidden="true" />
              <span>Referral Pro</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 