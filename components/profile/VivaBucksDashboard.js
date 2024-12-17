'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BsCoin } from 'react-icons/bs';
import { FaCrown, FaGift, FaTrophy, FaChartLine, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';
import TierBenefits from './rewards/TierBenefits';
import RewardHistory from './rewards/RewardHistory';
import TestPoints from './TestPoints';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { motion, AnimatePresence } from 'framer-motion';

const TIER_COLORS = {
  'Standard': '#6B7280',
  'Silver': '#94A3B8',
  'Gold': '#F59E0B',
  'Platinum': '#0EA5E9',
  'Diamond': '#6366F1',
  'Legend': '#8B5CF6'
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

  useEffect(() => {
    const handleRewardsUpdate = (event) => {
      console.log('Rewards update received:', event);
      refreshData();
    };

    window.addEventListener('rewardsUpdated', handleRewardsUpdate);
    eventEmitter.on(Events.POINTS_UPDATED, handleRewardsUpdate);
    eventEmitter.on(Events.REWARD_RESTORED, handleRewardsUpdate);

    return () => {
      window.removeEventListener('rewardsUpdated', handleRewardsUpdate);
      eventEmitter.off(Events.POINTS_UPDATED, handleRewardsUpdate);
      eventEmitter.off(Events.REWARD_RESTORED, handleRewardsUpdate);
    };
  }, []);

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
        eventEmitter.emit(Events.REWARD_RESTORED);
        
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Rewards Dashboard</h1>
          <p className="text-lg text-gray-600">Track your rewards and benefits</p>
        </motion.div>

        {/* Stats Grid - Single row layout with smaller text */}
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 mb-10 overflow-x-auto pb-4 -mx-4 px-4">
          {/* Available Balance Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300
                     border border-gray-100 overflow-hidden group
                     w-full sm:w-1/3 flex-shrink-0"
          >
            <div className="p-4 lg:p-6">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-100 text-orange-500 
                            group-hover:scale-110 transition-transform duration-300
                            shrink-0">
                  <BsCoin className="text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-medium text-gray-500 mb-0.5">Available Balance</h3>
                  <p className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                    ${rewardsData.vivaBucks.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 leading-relaxed pl-[44px]">
                Ready to use on your next purchase
              </div>
            </div>
          </motion.div>

          {/* Current Tier Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300
                     border border-gray-100 overflow-hidden group
                     w-full sm:w-1/3 flex-shrink-0"
          >
            <div className="p-4 lg:p-6">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-500 
                            group-hover:scale-110 transition-transform duration-300
                            shrink-0">
                  <FaCrown className="text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-medium text-gray-500 mb-0.5">Current Tier</h3>
                  <div className="flex items-baseline gap-1.5 truncate">
                    <p className="text-base lg:text-lg font-bold text-gray-900">
                      {rewardsData.currentTier}
                    </p>
                    <span className="text-xs font-medium text-gray-500">
                      ({rewardsData.pointsMultiplier}x)
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 leading-relaxed pl-[44px]">
                Your current membership level
              </div>
            </div>
          </motion.div>

          {/* Lifetime Points Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300
                     border border-gray-100 overflow-hidden group
                     w-full sm:w-1/3 flex-shrink-0"
          >
            <div className="p-4 lg:p-6">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-500 
                            group-hover:scale-110 transition-transform duration-300
                            shrink-0">
                  <FaTrophy className="text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-medium text-gray-500 mb-0.5">Lifetime Points</h3>
                  <p className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                    {rewardsData.cumulativePoints}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 leading-relaxed pl-[44px]">
                Total points earned to date
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tier Benefits Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <FaChartLine className="text-primary" />
              Tier Benefits
            </h2>
          </div>
          <TierBenefits
            currentTier={rewardsData.currentTier}
            cumulativePoints={rewardsData.cumulativePoints}
          />
        </motion.div>

        {/* Reward History Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <FaHistory className="text-primary" />
              Reward History
            </h2>
          </div>
          <RewardHistory />
        </motion.div>

        {/* Development Tools */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 space-y-6 p-8 bg-gray-100 rounded-2xl border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900">Development Tools</h2>
            <TestPoints 
              onPointsAdded={() => {
                refreshData();
                toast.success('Test points added successfully');
              }} 
            />
            <button
              onClick={handleResetPoints}
              className="px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 
                       transition-colors duration-200 font-medium"
            >
              Reset All Points (Dev Only)
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 