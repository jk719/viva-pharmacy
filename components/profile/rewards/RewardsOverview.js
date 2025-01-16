'use client';

import { REWARDS_CONFIG } from '@/lib/rewards/config';
import { RewardsUtils } from '@/lib/rewards/utils';

export default function RewardsOverview({ points, tier }) {
  const progress = RewardsUtils.calculateProgress(points);
  const availableRewards = progress.availableReward;
  const pointsToNext = progress.pointsToNextReward;
  const currentTier = REWARDS_CONFIG.MEMBERSHIP_TIERS[tier];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-500">Current Points</h3>
        <p className="mt-1 text-2xl font-semibold">{points.toLocaleString()}</p>
        <p className="text-sm text-gray-500">
          {pointsToNext} points to next reward
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-500">Available Rewards</h3>
        <p className="mt-1 text-2xl font-semibold">${availableRewards}</p>
        <p className="text-sm text-gray-500">Ready to redeem</p>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-500">Current Tier</h3>
        <p className="mt-1 text-2xl font-semibold">{currentTier.name}</p>
        <p className="text-sm text-gray-500">
          {currentTier.multiplier}x points earned
        </p>
      </div>
    </div>
  );
} 