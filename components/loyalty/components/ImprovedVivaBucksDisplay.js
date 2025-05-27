'use client';

import { FaCoins, FaStar, FaTrophy, FaArrowUp, FaInfoCircle } from 'react-icons/fa';
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Improved VivaBucks Display - Phase 1 Implementation
 * 
 * Key improvements:
 * 1. Unified VivaBucks model (clear separation of available vs. total earned)
 * 2. Progressive disclosure design
 * 3. Simplified 3-tier system
 * 4. Better visual hierarchy
 * 5. Mobile-optimized
 * 6. Backwards compatibility with old VivaBucksDisplay props
 */

// Tier color configurations for new 3-tier system
const TIER_COLORS = {
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
  // Legacy tier support (mapped to new tiers)
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

// Tier icons for new system
const TIER_ICONS = {
  EXPLORER: <FaCoins className="w-4 h-4" />,
  ADVENTURER: <FaStar className="w-4 h-4" />,
  CHAMPION: <FaTrophy className="w-4 h-4" />,
  // Legacy tier support
  BRONZE: <FaCoins className="w-4 h-4" />,
  SILVER: <FaStar className="w-4 h-4" />,
  GOLD: <FaStar className="w-4 h-4" />,
  PLATINUM: <FaTrophy className="w-4 h-4" />,
  SAPPHIRE: <FaTrophy className="w-4 h-4" />,
  DIAMOND: <FaTrophy className="w-4 h-4" />,
  LEGEND: <FaTrophy className="w-4 h-4" />
};

/**
 * Main VivaBucks Display Component
 * Supports both new unified format and legacy props for backwards compatibility
 */
function ImprovedVivaBucksDisplay({
  // New props format (preferred)
  userData,
  progressInfo,
  variant = "banner",
  showProgress = true,
  animated = false,
  className = "",
  
  // Legacy props format (for backwards compatibility)
  currentVivaBucks,
  lifetimeVivaBucks,
  currentTier,
  multiplier
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Handle backwards compatibility - convert old props to new format
  let finalUserData = userData;
  if (!userData && (currentVivaBucks !== undefined || currentTier)) {
    console.log('🔄 [ImprovedVivaBucksDisplay] Using legacy props format - consider updating to new format');
    finalUserData = {
      availableVivaBucks: currentVivaBucks || 0,
      totalVivaBucksEarned: lifetimeVivaBucks || currentVivaBucks || 0,
      currentTier: currentTier || 'EXPLORER',
      pointsMultiplier: multiplier || 1,
      vivaBucks: currentVivaBucks || 0,
      cumulativeVivaBucks: lifetimeVivaBucks || currentVivaBucks || 0
    };
  }

  if (!finalUserData) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg h-16 ${className}`}>
        <div className="flex items-center h-full px-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const {
    availableVivaBucks = 0,
    totalVivaBucksEarned = 0,
    currentTier: userTier = 'EXPLORER',
    pointsMultiplier = 1
  } = finalUserData;

  const tierColors = TIER_COLORS[userTier] || TIER_COLORS.EXPLORER;
  const TierIcon = TIER_ICONS[userTier] || TIER_ICONS.EXPLORER;

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 10000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  // Get next tier info
  const getNextTierInfo = () => {
    // Map legacy tiers to new system for progression
    const tierMap = {
      'BRONZE': 'EXPLORER',
      'SILVER': 'ADVENTURER', 
      'GOLD': 'ADVENTURER',
      'PLATINUM': 'CHAMPION',
      'SAPPHIRE': 'CHAMPION',
      'DIAMOND': 'CHAMPION',
      'LEGEND': 'CHAMPION'
    };
    
    const mappedTier = tierMap[userTier] || userTier;
    
    if (mappedTier === 'CHAMPION') return null;
    
    const nextTier = mappedTier === 'EXPLORER' ? 'ADVENTURER' : 'CHAMPION';
    const nextTierThreshold = nextTier === 'ADVENTURER' ? 1000 : 5000;
    const pointsNeeded = Math.max(0, nextTierThreshold - totalVivaBucksEarned);
    const progress = Math.min(100, (totalVivaBucksEarned / nextTierThreshold) * 100);
    
    return { nextTier, pointsNeeded, progress };
  };

  const nextTierInfo = getNextTierInfo();

  // Handle legacy "default" variant
  const displayVariant = variant === "default" ? "banner" : variant;

  // Render different variants
  switch (displayVariant) {
    case "card":
      return (
        <div className={`bg-white rounded-xl shadow-sm border ${tierColors.border} overflow-hidden ${className}`}>
          <div className={`h-2 bg-gradient-to-r ${tierColors.bg}`}></div>
          
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your VivaBucks</h3>
                <p className="text-sm text-gray-500">Ready to use</p>
              </div>
              <div className={`flex items-center ${tierColors.accent} px-3 py-1.5 rounded-full`}>
                <span className={tierColors.icon}>{TierIcon}</span>
                <span className={`ml-2 text-sm font-medium ${tierColors.text}`}>
                  {userTier}
                </span>
              </div>
            </div>

            {/* Available VivaBucks */}
            <div className="mb-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {formatNumber(availableVivaBucks)}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  (${(availableVivaBucks * 0.1).toFixed(2)} value)
                </span>
              </div>
            </div>

            {/* Earning Rate */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Earning rate:</span>
              <span className={`font-medium ${tierColors.text}`}>
                {pointsMultiplier}x VivaBucks
              </span>
            </div>

            {/* Progress to next tier */}
            {nextTierInfo && showProgress && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">
                    Progress to {nextTierInfo.nextTier}
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {formatNumber(nextTierInfo.pointsNeeded)} more needed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 bg-gradient-to-r ${tierColors.bg} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${nextTierInfo.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case "compact":
      return (
        <div className={`flex items-center space-x-3 ${className}`}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${tierColors.bg} shadow-sm`}>
            <span className="text-white">{TierIcon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatNumber(availableVivaBucks)}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${tierColors.bg}`}>
                {pointsMultiplier}x
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {userTier} • ${(availableVivaBucks * 0.1).toFixed(2)} value
            </p>
          </div>
        </div>
      );

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
                    {formatNumber(availableVivaBucks)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
              <div className="mr-2">
                {TierIcon}
              </div>
              <span className="text-sm font-semibold">{userTier}</span>
            </div>
          </div>
          
          {totalVivaBucksEarned > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Lifetime VivaBucks: {formatNumber(totalVivaBucksEarned)}
            </div>
          )}
        </div>
      );

    default: // banner variant (includes legacy "default")
      return (
        <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
          <div className="p-4">
            {/* Main display - Level 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Tier icon */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${tierColors.bg} shadow-sm`}>
                  <span className="text-white text-lg">{TierIcon}</span>
                </div>
                
                {/* VivaBucks info */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">
                      {formatNumber(availableVivaBucks)}
                    </span>
                    <span className="text-sm text-gray-500">VivaBucks available</span>
                    <span className={`text-xs px-2 py-1 rounded-full text-white bg-gradient-to-r ${tierColors.bg}`}>
                      {pointsMultiplier}x earning
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-sm font-medium ${tierColors.text}`}>
                      {userTier} Member
                    </span>
                    <span className="text-sm text-gray-500">
                      ${(availableVivaBucks * 0.1).toFixed(2)} redemption value
                    </span>
                  </div>
                </div>
              </div>

              {/* Details toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaInfoCircle className="w-4 h-4" />
                <span>{showDetails ? 'Less' : 'More'}</span>
              </button>
            </div>

            {/* Expanded details - Level 2 */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Lifetime stats */}
                      <div className={`${tierColors.accent} rounded-lg p-3`}>
                        <h4 className={`text-sm font-medium ${tierColors.text} mb-2`}>
                          Lifetime Stats
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total earned:</span>
                            <span className="font-medium">{formatNumber(totalVivaBucksEarned)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total value:</span>
                            <span className="font-medium">${(totalVivaBucksEarned * 0.1).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Next tier progress */}
                      {nextTierInfo ? (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Next Tier Progress
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">To {nextTierInfo.nextTier}:</span>
                              <span className="font-medium">{formatNumber(nextTierInfo.pointsNeeded)} more</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 bg-gradient-to-r ${tierColors.bg} rounded-full transition-all duration-1000`}
                                style={{ width: `${nextTierInfo.progress}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round(nextTierInfo.progress)}% complete
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-purple-700 mb-1">
                            🏆 Maximum Tier Reached!
                          </h4>
                          <p className="text-xs text-purple-600">
                            You're at the highest tier with the best benefits
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
  }
}

export default memo(ImprovedVivaBucksDisplay); 