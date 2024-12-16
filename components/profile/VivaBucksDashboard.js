'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BsCoin } from 'react-icons/bs';
import { FaCrown, FaGift, FaTrophy } from 'react-icons/fa';
import toast from 'react-hot-toast';
import TierBenefits from './rewards/TierBenefits';
import RewardHistory from './rewards/RewardHistory';
import TestPoints from './TestPoints';
import eventEmitter, { Events } from '@/lib/eventEmitter';

const TIER_COLORS = {
  'Standard': '#6B7280', // gray-500
  'Silver': '#94A3B8',   // slate-400
  'Gold': '#F59E0B',     // amber-500
  'Platinum': '#0EA5E9', // sky-500
  'Diamond': '#6366F1',  // indigo-500
  'Legend': '#8B5CF6'    // violet-500
};

export default function VivaBucksDashboard() {
  const { data: session, status } = useSession();
  const [rewardsData, setRewardsData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const handleResetPoints = async () => {
    if (!confirm('Are you sure you want to reset all your points? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/user/vivabucks/test', {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        setRewardsData({
          ...rewardsData,
          rewardPoints: 0,
          cumulativePoints: 0,
          vivaBucks: 0,
          currentTier: 'STANDARD',
          pointsMultiplier: 1,
          nextRewardMilestone: 100
        });
        
        eventEmitter.emit(Events.POINTS_RESET);
        
        toast.success('Points and rewards reset successfully!');
        
        refreshData();
      } else {
        toast.error('Error resetting points: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error resetting points');
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

      {/* Test Points and Reset Button (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="space-y-4">
          <TestPoints 
            onPointsAdded={() => {
              refreshData();
              toast.success('Test points added successfully');
            }} 
          />
          <button
            onClick={handleResetPoints}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 ease-in-out"
          >
            Reset All Points (Dev Only)
          </button>
        </div>
      )}
    </div>
  );
} 