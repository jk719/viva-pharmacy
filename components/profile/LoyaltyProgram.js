"use client";

import { useState, useEffect } from 'react';
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig';
import { calculateProgressToNextTier } from '@/lib/loyalty/loyaltyCalculator';

export default function LoyaltyProgram({ user }) {
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    const currentPoints = user.rewardHistory?.reduce((total, tx) => {
      if (tx.type === 'POINTS_EARNED') {
        return total + (tx.adjustedPoints || 0);
      } else if (tx.type === 'REWARD_REDEEMED') {
        return total - (tx.pointsUsed || 0);
      }
      return total;
    }, 0) || 0;

    setProgressData(calculateProgressToNextTier(currentPoints, TIER_CONFIG));
  }, [user]);

  const currentTier = user.rewardHistory
    ?.filter(tx => tx.type === 'TIER_CHANGED')
    ?.pop()?.newTier || 'STANDARD';

  const currentPoints = user.rewardHistory?.reduce((total, tx) => {
    if (tx.type === 'POINTS_EARNED') {
      return total + (tx.adjustedPoints || 0);
    } else if (tx.type === 'REWARD_REDEEMED') {
      return total - (tx.pointsUsed || 0);
    }
    return total;
  }, 0) || 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#003366]">VivaBucks Rewards</h2>
        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          {currentTier}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Current Points</p>
          <p className="text-2xl font-bold text-[#003366]">
            {currentPoints.toLocaleString()}
          </p>
        </div>

        {progressData && (
          <div>
            <div className="relative pt-1">
              <p className="text-sm text-gray-600 mb-1">
                {progressData.pointsNeeded.toLocaleString()} points to {progressData.nextTier}
              </p>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                <div
                  style={{
                    width: `${progressData.progress}%`
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {user.loyaltyProgram?.coupons?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Available Coupons</h3>
            <div className="space-y-2">
              {user.loyaltyProgram.coupons
                .filter(coupon => !coupon.isUsed)
                .map((coupon, index) => (
                  <div
                    key={index}
                    className="border p-3 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">${coupon.amount} Off</p>
                      <p className="text-sm text-gray-500">Code: {coupon.code}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 