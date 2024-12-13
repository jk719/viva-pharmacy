'use client';

import { REWARDS_CONFIG } from '@/lib/rewards/config';

export default function BonusOpportunities() {
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-medium">Earn Bonus Points</h3>
      </div>
      <div className="divide-y">
        {Object.entries(REWARDS_CONFIG.BONUSES).map(([key, points]) => (
          <div key={key} className="p-4">
            <p className="font-medium">
              {key.split('_').map(word => 
                word.charAt(0) + word.slice(1).toLowerCase()
              ).join(' ')}
            </p>
            <p className="text-sm text-gray-500">
              Earn {points} points
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 