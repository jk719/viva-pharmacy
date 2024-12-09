'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaCrown, FaGift } from 'react-icons/fa';
import { BsCoin } from 'react-icons/bs';
import TestPoints from './TestPoints';

const TIER_COLORS = {
  Standard: 'bg-gray-500',
  Silver: 'bg-gray-300',
  Gold: 'bg-yellow-500',
  Platinum: 'bg-purple-500',
  Sapphire: 'bg-blue-500',
  Diamond: 'bg-cyan-500',
  Legend: 'bg-red-500'
};

const TIER_BENEFITS = {
  Standard: ['Base earning rate', 'Regular rewards'],
  Silver: ['1.25x points multiplier', 'All Standard benefits'],
  Gold: ['1.5x points multiplier', 'Priority support', 'All Silver benefits'],
  Platinum: ['1.75x points multiplier', 'Exclusive offers', 'All Gold benefits'],
  Sapphire: ['2x points multiplier', 'Birthday bonus', 'All Platinum benefits'],
  Diamond: ['2.25x points multiplier', 'VIP support', 'All Sapphire benefits'],
  Legend: ['2.5x points multiplier', 'Custom perks', 'All Diamond benefits']
};

const REWARD_TIERS = [
  { points: 100, amount: 5 },
  { points: 200, amount: 15 },
  { points: 400, amount: 30 },
  { points: 600, amount: 50 },
  { points: 800, amount: 75 },
  { points: 1000, amount: 100 }
];

export default function VivaBucksDashboard() {
  const { data: session, status } = useSession();
  const [rewardsData, setRewardsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    async function fetchRewardsData() {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setLoading(true);
          const response = await fetch(`/api/user/vivabucks/${session.user.id}`, {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          setRewardsData(data);
        } catch (error) {
          console.error('Error fetching rewards data:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchRewardsData();
  }, [session, status]);

  // Calculate available and next rewards
  const calculateRewards = (points) => {
    let availableReward = null;
    let nextReward = null;

    for (const tier of REWARD_TIERS) {
      if (points >= tier.points) {
        availableReward = tier;
      } else {
        nextReward = tier;
        break;
      }
    }

    return { availableReward, nextReward };
  };

  const handleRedeemReward = async () => {
    if (!rewardsData || redeeming) return;

    setRedeeming(true);
    try {
      const response = await fetch(`/api/user/vivabucks/${session.user.id}/redeem`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setRewardsData(data);
        // Show success message
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      // Show error message
    } finally {
      setRedeeming(false);
    }
  };

  // Show loading state while checking session
  if (status === 'loading' || loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-32 bg-gray-100 rounded-lg"></div>
      <div className="h-48 bg-gray-100 rounded-lg"></div>
    </div>;
  }

  // Show message if not authenticated
  if (status === 'unauthenticated') {
    return <div>Please sign in to view your rewards</div>;
  }

  if (!rewardsData) return null;

  const { availableReward, nextReward } = calculateRewards(rewardsData.rewardPoints);

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <BsCoin className="text-orange-500 text-xl" />
            <span className="text-gray-600">Available Balance</span>
          </div>
          <div className="text-3xl font-bold text-[#003366]">
            ${rewardsData.vivaBucks.toFixed(2)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FaCrown className={`text-xl ${TIER_COLORS[rewardsData.currentTier]} text-opacity-90`} />
            <span className="text-gray-600">Current Tier</span>
          </div>
          <div className="text-xl font-semibold text-[#003366]">
            {rewardsData.currentTier}
            <span className="text-sm text-gray-500 ml-2">
              ({rewardsData.pointsMultiplier}x multiplier)
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FaGift className="text-primary-color text-xl" />
            <span className="text-gray-600">Next Reward</span>
          </div>
          <div className="text-xl font-semibold text-[#003366]">
            ${rewardsData.nextRewardAmount}
            <span className="text-sm text-gray-500 ml-2">
              in {rewardsData.nextRewardMilestone - rewardsData.rewardPoints} points
            </span>
          </div>
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-[#003366]">Your Tier Benefits</h3>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            {TIER_BENEFITS[rewardsData.currentTier].map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${TIER_COLORS[rewardsData.currentTier]}`} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-[#003366] mb-4">Points Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Points</span>
              <span className="font-medium">{rewardsData.rewardPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lifetime Points</span>
              <span className="font-medium">{rewardsData.cumulativePoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Points to Next Tier</span>
              <span className="font-medium">
                {Math.max(0, 1000 - (rewardsData.cumulativePoints % 1000))}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-[#003366] mb-4">Rewards Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Progress</span>
              <span className="font-medium">
                {rewardsData.rewardPoints} / {rewardsData.nextRewardMilestone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Next Reward</span>
              <span className="font-medium">${rewardsData.nextRewardAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Points Multiplier</span>
              <span className="font-medium">{rewardsData.pointsMultiplier}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Reward Card */}
      {availableReward && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Reward Available!
              </h3>
              <p className="text-green-600">
                You've earned a ${availableReward.amount} reward
              </p>
            </div>
            <button
              onClick={handleRedeemReward}
              disabled={redeeming}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {redeeming ? 'Redeeming...' : 'Redeem Now'}
            </button>
          </div>
        </div>
      )}

      {/* Next Reward Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-[#003366] mb-4">
          {availableReward ? 'Next Reward Available At' : 'Current Reward Progress'}
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{rewardsData.rewardPoints} / {nextReward?.points || 1000} points</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${(rewardsData.rewardPoints / (nextReward?.points || 1000)) * 100}%`
                }}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Next Reward</span>
            <span className="font-medium">
              ${nextReward?.amount || 100}
              {nextReward?.points === 1000 && ' + 100 bonus points'}
            </span>
          </div>
        </div>
      </div>

      {/* Reward Tiers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-[#003366]">Reward Tiers</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {REWARD_TIERS.map((tier) => (
              <div
                key={tier.points}
                className={`p-3 rounded-lg border ${
                  rewardsData.rewardPoints >= tier.points
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="text-sm text-gray-600">{tier.points} points</div>
                <div className="font-semibold">
                  ${tier.amount}
                  {tier.points === 1000 && (
                    <span className="text-xs text-green-600 block">
                      +100 bonus points
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && <TestPoints />}
    </div>
  );
} 