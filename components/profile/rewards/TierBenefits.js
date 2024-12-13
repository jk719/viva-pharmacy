'use client';

import { FaCrown } from 'react-icons/fa';
import { REWARDS_CONFIG } from '@/lib/rewards/config';

// Add tier colors
const TIER_COLORS = {
  'STANDARD': 'text-gray-500',
  'SILVER': 'text-gray-400',
  'GOLD': 'text-yellow-500',
  'PLATINUM': 'text-purple-500'
};

export default function TierBenefits({ 
  currentTier = 'STANDARD',
  cumulativePoints = 0
}) {
  if (!REWARDS_CONFIG?.MEMBERSHIP_TIERS) {
    console.error('MEMBERSHIP_TIERS not found in REWARDS_CONFIG');
    return null;
  }

  const nextTier = getNextTier(currentTier);
  const pointsToNextTier = getPointsToNextTier(currentTier, cumulativePoints);
  const currentTierConfig = REWARDS_CONFIG.MEMBERSHIP_TIERS[currentTier] || REWARDS_CONFIG.MEMBERSHIP_TIERS.STANDARD;

  function getNextTier(tier) {
    const tiers = Object.keys(REWARDS_CONFIG.MEMBERSHIP_TIERS);
    const currentIndex = tiers.indexOf(tier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  function getPointsToNextTier(tier, points) {
    const nextTierName = getNextTier(tier);
    if (!nextTierName) return null;
    return Math.max(0, REWARDS_CONFIG.MEMBERSHIP_TIERS[nextTierName].minPoints - points);
  }

  function getProgressPercentage(points, nextTierPoints) {
    const currentTierMin = REWARDS_CONFIG.MEMBERSHIP_TIERS[currentTier].minPoints;
    const progress = (points - currentTierMin) / (nextTierPoints - currentTierMin) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  if (!currentTierConfig) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Current Tier */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <FaCrown className={`${TIER_COLORS[currentTier] || 'text-gray-500'} text-xl mr-2`} />
            <h3 className="font-medium text-gray-900">
              {currentTier} Tier
            </h3>
          </div>
          <span className="text-lg font-semibold">
            {currentTierConfig.multiplier}x
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            Earn {((currentTierConfig.multiplier || 1) - 1) * 100}% bonus points
          </p>
          <p>
            $1 = {currentTierConfig.multiplier || 1} points
          </p>
          <p className="mt-1">
            Every {REWARDS_CONFIG.REWARD_RATE?.POINTS_NEEDED || 100} points = 
            ${REWARDS_CONFIG.REWARD_RATE?.REWARD_AMOUNT || 5} reward
          </p>
        </div>
      </div>

      {/* Next Tier Progress */}
      {nextTier && pointsToNextTier && REWARDS_CONFIG.MEMBERSHIP_TIERS[nextTier] && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Next Tier: {nextTier}
            </span>
            <span className="font-medium text-gray-900">
              {pointsToNextTier.toLocaleString()} points needed
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
              style={{
                width: `${getProgressPercentage(cumulativePoints, REWARDS_CONFIG.MEMBERSHIP_TIERS[nextTier].minPoints)}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 