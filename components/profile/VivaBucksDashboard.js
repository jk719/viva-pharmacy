'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BsCoin } from 'react-icons/bs';
import { FaCrown, FaGift, FaTrophy } from 'react-icons/fa';
import toast from 'react-hot-toast';
import RewardCard from './rewards/RewardCard';
import ProgressBar from './rewards/ProgressBar';
import TierBenefits from './rewards/TierBenefits';
import RewardHistory from './rewards/RewardHistory';
import TestPoints from './TestPoints';

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

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
          console.log('Fetched rewards data:', data);
          setRewardsData(data);
        } catch (error) {
          console.error('Error fetching rewards data:', error);
          toast.error('Failed to load rewards data');
        } finally {
          setLoading(false);
        }
      }
    }

    fetchRewardsData();
  }, [session, status, refreshTrigger]);

  const handleRedeemReward = async (milestone) => {
    if (!rewardsData || redeeming) return;

    const rewardAmount = REWARD_TIERS.find(tier => tier.points === milestone)?.amount;
    
    setRedeeming(true);
    const redeemToast = toast.loading('Redeeming reward...');
    
    try {
      const response = await fetch(`/api/user/vivabucks/${session.user.id}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ milestone })
      });

      const data = await response.json();

      if (response.ok) {
        setRewardsData(data);
        refreshData();
        toast.success(
          `Successfully redeemed $${rewardAmount} reward!`, 
          { id: redeemToast }
        );
      } else {
        toast.error(
          data.error || 'Failed to redeem reward', 
          { id: redeemToast }
        );
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error(
        'An error occurred while redeeming reward', 
        { id: redeemToast }
      );
    } finally {
      setRedeeming(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-32 bg-gray-100 rounded-lg"></div>
      <div className="h-48 bg-gray-100 rounded-lg"></div>
    </div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to view your rewards</p>
      </div>
    );
  }

  if (!rewardsData) return null;

  return (
    <div className="space-y-6">
      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <FaCrown className="text-xl" />
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

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FaTrophy className="text-yellow-500 text-xl" />
            <span className="text-gray-600">Lifetime Points</span>
          </div>
          <div className="text-xl font-semibold text-[#003366]">
            {rewardsData.cumulativePoints}
            <span className="text-sm text-gray-500 ml-2">
              total earned
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <ProgressBar
          currentPoints={rewardsData.rewardPoints}
          nextMilestone={rewardsData.nextRewardMilestone}
          animate={true}
        />
      </div>

      {/* Available Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REWARD_TIERS.map((tier) => (
          <RewardCard
            key={tier.points}
            points={rewardsData.rewardPoints}
            milestone={tier.points}
            onRedeem={() => handleRedeemReward(tier.points)}
            isLoading={redeeming}
          />
        ))}
      </div>

      {/* Tier Benefits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <TierBenefits
          currentTier={rewardsData.currentTier}
          cumulativePoints={rewardsData.cumulativePoints}
        />
      </div>

      {/* Reward History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <RewardHistory />
      </div>

      {/* Test Points (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <TestPoints 
          onPointsAdded={() => {
            refreshData();
            toast.success('Test points added successfully');
          }} 
        />
      )}
    </div>
  );
} 