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
  isMobile = false,
  showBadges = true
}) {
  const tierColors = TIER_COLORS[currentTier] || TIER_COLORS.BRONZE;
  const Icon = TIER_ICONS[currentTier] || TIER_ICONS.BRONZE;
  
  return (
    <div className="flex items-center space-x-2 md:space-x-4 flex-1 z-10" data-testid="tier-points-display">
      {/* Tier icon */}
      <div 
        className={`flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-12 h-12'} rounded-full relative shadow-sm`}
        data-testid="tier-icon-container"
      >
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${tierColors?.bg || 'from-gray-100 to-gray-300'} opacity-60`} 
        />
        <div 
          className={`relative z-20 ${isMobile ? 'scale-90' : 'scale-110'} ${tierColors?.icon || 'text-gray-600'}`}
        >
          {Icon}
        </div>
      </div>

      {/* Tier and points info */}
      <div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <h3 
            className={`${isMobile ? 'text-xs' : 'text-sm md:text-base'} font-bold tracking-wider uppercase ${tierColors?.text || 'text-gray-700'}`}
            data-testid="tier-name"
          >
            {currentTier}
          </h3>
          <span 
            className={`${isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-xs md:text-sm px-2 py-0.5'} rounded-full text-white font-semibold bg-gradient-to-r from-[#FF6B00] to-[#FF9F43]`}
            data-testid="multiplier-badge"
          >
            {multiplier}x
          </span>
        </div>

        {/* Points display - simplified without unnecessary wrapper */}
        <div className="flex items-baseline space-x-1 md:space-x-2 mt-0.5 md:mt-1">
          <div className="flex items-center">
            <div className="relative mr-1 md:mr-1.5">
              <FaCoins 
                className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-[#FF6B00]`} 
                aria-hidden="true"
              />
            </div>
            <span 
              className={`${isMobile ? 'text-sm' : 'text-base md:text-xl'} font-extrabold text-gray-800`}
              data-testid="points-value"
            >
              {points.toLocaleString()}
            </span>
          </div>
          <span className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-gray-500`}>
            VivaBucks
          </span>
        </div>

        {/* Badges */}
        {showBadges && (
          <div className="flex space-x-1 md:space-x-2 mt-1 md:mt-2" data-testid="loyalty-badges">
            {/* First Purchase Badge */}
            <div className={`${isMobile ? 'text-[6px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'} rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white font-medium flex items-center`}>
              <FaGift className={`${isMobile ? 'h-1.5 w-1.5' : 'h-2 w-2'} mr-0.5`} aria-hidden="true" />
              <span>First Purchase</span>
            </div>

            {/* Loyal Customer Badge */}
            <div className={`${isMobile ? 'text-[6px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'} rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white font-medium flex items-center`}>
              <IoMdStar className={`${isMobile ? 'h-1.5 w-1.5' : 'h-2 w-2'} mr-0.5`} aria-hidden="true" />
              <span>Loyal Customer</span>
            </div>

            {/* Referral Badge */}
            <div className={`${isMobile ? 'text-[6px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'} rounded-full bg-gradient-to-r from-purple-400 to-purple-500 text-white font-medium flex items-center`}>
              <FaArrowUp className={`${isMobile ? 'h-1.5 w-1.5' : 'h-2 w-2'} mr-0.5`} aria-hidden="true" />
              <span>Referral Pro</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 