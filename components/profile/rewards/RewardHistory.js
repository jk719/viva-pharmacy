'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaGift } from 'react-icons/fa';
import { REWARDS_CONFIG } from '@/lib/rewards/config';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export default function RewardHistory() {
  const { data: session } = useSession();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchRewardHistory = async () => {
    console.log('🔄 Fetching reward history...');
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/user/vivabucks/${session.user.id}/redeem`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reward history');
      }

      const data = await response.json();
      console.log('📥 Raw history data:', data.history);

      const filteredHistory = (data.history || []).filter(entry => 
        entry.type === 'REWARD_REDEEMED' && entry.source === 'redemption'
      );
      console.log('🔍 Filtered history:', filteredHistory);

      setHistory(filteredHistory);
    } catch (err) {
      console.error('❌ Error fetching reward history:', err);
      setError('Unable to load reward history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleRewardRedeemed = () => {
      console.log('🎯 Reward redeemed event received');
      setRefreshKey(prev => prev + 1);
    };

    eventEmitter.on(Events.REWARD_REDEEMED, handleRewardRedeemed);
    eventEmitter.on(Events.POINTS_UPDATED, handleRewardRedeemed);
    
    return () => {
      eventEmitter.off(Events.REWARD_REDEEMED, handleRewardRedeemed);
      eventEmitter.off(Events.POINTS_UPDATED, handleRewardRedeemed);
    };
  }, []);

  useEffect(() => {
    fetchRewardHistory();
  }, [session?.user?.id, refreshKey]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4">
          <p className="text-gray-500 text-center">Please sign in to view your reward history</p>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4">
          <div className="text-center py-6">
            <FaGift className="mx-auto text-[#FF9F43] text-3xl mb-2" />
            <p className="text-gray-500">No rewards redeemed yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Earn {REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED} points to get your first ${REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT} reward
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Reward History</h3>
        <p className="text-sm text-gray-500 mt-1">
          {REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED} points = ${REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT} reward
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {history.map((reward, index) => (
          <div key={reward._id || reward.id || index} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaGift className="text-[#FF9F43]" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ${reward.amount} Reward {reward.status || 'Redeemed'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(reward.timestamp || reward.createdAt).toLocaleDateString()} at{' '}
                    {new Date(reward.timestamp || reward.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  {(reward.pointsUsed || reward.points)?.toLocaleString()} points
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 