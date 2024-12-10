'use client';

import { useState, useEffect } from 'react';
import { FaGift } from 'react-icons/fa';

// Mock data for testing
const MOCK_HISTORY = [
  {
    id: 1,
    amount: 5,
    pointsUsed: 100,
    redeemedAt: '2024-03-15T10:00:00Z'
  },
  {
    id: 2,
    amount: 15,
    pointsUsed: 200,
    redeemedAt: '2024-03-10T15:30:00Z'
  },
  {
    id: 3,
    amount: 30,
    pointsUsed: 400,
    redeemedAt: '2024-03-05T09:15:00Z'
  }
];

export default function RewardHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRewardHistory = async () => {
      try {
        // Simulating API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHistory(MOCK_HISTORY);
      } catch (err) {
        console.error('Error fetching reward history:', err);
        setError('Unable to load reward history');
      } finally {
        setLoading(false);
      }
    };

    fetchRewardHistory();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="animate-pulse space-y-4">
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
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="text-center py-6">
          <FaGift className="mx-auto text-gray-400 text-3xl mb-2" />
          <p className="text-gray-500">No rewards redeemed yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Reward History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {history.map((reward) => (
          <div key={reward.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaGift className="text-primary-color" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ${reward.amount} Reward Redeemed
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(reward.redeemedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {reward.pointsUsed} points
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 