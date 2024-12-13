'use client';

import { useState } from 'react';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { REWARDS_CONFIG } from '@/lib/rewards/config';

// Add preset point values for common testing scenarios
const PRESET_POINTS = [
  { value: 100, label: `100 (${REWARDS_CONFIG.formatCurrency(REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT)})` },
  { value: 1000, label: 'Silver Tier' },
  { value: 2500, label: 'Gold Tier' },
  { value: 5000, label: 'Platinum Tier' }
];

export default function TestPoints({ onPointsAdded }) {
  const [points, setPoints] = useState(100);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleAddPoints = async (points) => {
    setLoading(true);
    setFeedback('');
    
    try {
      const response = await fetch('/api/user/vivabucks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onPointsAdded();
        eventEmitter.emit(Events.POINTS_UPDATED);
        setFeedback(`Added ${REWARDS_CONFIG.formatPoints(points)} points!`);
      } else {
        setFeedback(data.error || 'Failed to add points');
      }
    } catch (error) {
      console.error('Error adding test points:', error);
      setFeedback('Error adding points');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Test Points</h3>
      
      {/* Preset buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {PRESET_POINTS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleAddPoints(value)}
            disabled={loading}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-md 
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:ring-offset-2 disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom points input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Custom points"
            min="0"
          />
        </div>
        <button
          onClick={() => handleAddPoints(points)}
          disabled={loading || points <= 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                   disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none 
                   focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
          ) : (
            'Add Points'
          )}
        </button>
      </div>

      {/* Feedback message */}
      {feedback && (
        <p className={`mt-2 text-sm ${feedback.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {feedback}
        </p>
      )}

      {/* Help text */}
      <p className="mt-2 text-xs text-gray-500">
        Use preset buttons to test different membership tiers or enter a custom amount.
        {REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED} points = {REWARDS_CONFIG.formatCurrency(REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT)}
      </p>
    </div>
  );
} 