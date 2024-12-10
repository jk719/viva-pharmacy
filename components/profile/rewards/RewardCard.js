'use client';

import { FaGift } from 'react-icons/fa';

const REWARD_TIERS = {
  100: { amount: 5, description: 'Basic Reward' },
  200: { amount: 15, description: 'Bronze Reward' },
  400: { amount: 30, description: 'Silver Reward' },
  600: { amount: 50, description: 'Gold Reward' },
  800: { amount: 75, description: 'Platinum Reward' },
  1000: { amount: 100, description: 'Diamond Reward' }
};

export default function RewardCard({ 
  points, 
  milestone, 
  onRedeem, 
  isLoading 
}) {
  const canRedeem = points >= milestone;
  const reward = REWARD_TIERS[milestone];

  return (
    <div className={`
      p-4 rounded-lg border transition-all duration-200
      ${canRedeem 
        ? 'border-green-200 bg-green-50 hover:shadow-md' 
        : 'border-gray-200 bg-white'
      }
    `}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <FaGift className={`
            text-xl mr-2
            ${canRedeem ? 'text-green-600' : 'text-gray-400'}
          `} />
          <div>
            <h3 className="font-medium text-gray-900">
              ${reward.amount} Reward
            </h3>
            <p className="text-sm text-gray-500">
              {reward.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-gray-900">
            {milestone} points
          </span>
          <div className="text-xs text-gray-500">
            required
          </div>
        </div>
      </div>

      <div className="mt-2">
        <button
          onClick={onRedeem}
          disabled={!canRedeem || isLoading}
          className={`
            w-full py-2 px-4 rounded-md text-sm font-medium
            transition-colors duration-200
            ${canRedeem
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
            disabled:opacity-50
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redeeming...
            </span>
          ) : canRedeem ? (
            'Redeem Reward'
          ) : (
            `${milestone - points} points needed`
          )}
        </button>
      </div>
    </div>
  );
} 