'use client';

import { FaCrown } from 'react-icons/fa';

const TIER_BENEFITS = {
  Standard: {
    color: 'text-gray-500',
    multiplier: '1x',
    benefits: ['Base earning rate', 'Standard rewards']
  },
  Silver: {
    color: 'text-gray-400',
    multiplier: '1.25x',
    benefits: ['25% bonus points', 'Silver member benefits']
  },
  Gold: {
    color: 'text-yellow-500',
    multiplier: '1.5x',
    benefits: ['50% bonus points', 'Priority support', 'Gold member benefits']
  },
  Platinum: {
    color: 'text-purple-500',
    multiplier: '1.75x',
    benefits: ['75% bonus points', 'Exclusive offers', 'Platinum perks']
  },
  Sapphire: {
    color: 'text-blue-500',
    multiplier: '2x',
    benefits: ['Double points', 'Premium support', 'Sapphire exclusives']
  },
  Diamond: {
    color: 'text-cyan-500',
    multiplier: '2.25x',
    benefits: ['125% bonus points', 'VIP support', 'Diamond privileges']
  },
  Legend: {
    color: 'text-red-500',
    multiplier: '2.5x',
    benefits: ['150% bonus points', 'Concierge service', 'Legend status benefits']
  }
};

export default function TierBenefits({ 
  currentTier, 
  cumulativePoints 
}) {
  const nextTier = getNextTier(currentTier);
  const pointsToNextTier = getPointsToNextTier(currentTier, cumulativePoints);

  function getNextTier(tier) {
    const tiers = Object.keys(TIER_BENEFITS);
    const currentIndex = tiers.indexOf(tier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  function getPointsToNextTier(tier, points) {
    const thresholds = {
      Standard: 1000,
      Silver: 2000,
      Gold: 4000,
      Platinum: 6000,
      Sapphire: 8000,
      Diamond: 10000
    };
    return thresholds[tier] ? thresholds[tier] - points : null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Current Tier */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <FaCrown className={`${TIER_BENEFITS[currentTier].color} text-xl mr-2`} />
            <h3 className="font-medium text-gray-900">
              {currentTier} Tier
            </h3>
          </div>
          <span className="text-lg font-semibold">
            {TIER_BENEFITS[currentTier].multiplier}
          </span>
        </div>
        
        <ul className="space-y-1">
          {TIER_BENEFITS[currentTier].benefits.map((benefit, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-center">
              <span className="mr-2">•</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* Next Tier Progress */}
      {nextTier && pointsToNextTier && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Next Tier: {nextTier}
            </span>
            <span className="font-medium text-gray-900">
              {pointsToNextTier} points needed
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
              style={{
                width: `${(cumulativePoints / (cumulativePoints + pointsToNextTier)) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 