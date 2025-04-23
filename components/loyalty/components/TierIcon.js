'use client';

import { TIER_COLORS, TIER_ICONS } from '../constants/tierConfig';

/**
 * Icon component for loyalty tiers with appropriate styling
 */
export default function TierIcon({ tier = 'BRONZE', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Handle potential undefined tier
  const tierColors = TIER_COLORS[tier] || TIER_COLORS.BRONZE;
  const Icon = TIER_ICONS[tier] || TIER_ICONS.BRONZE;

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative shadow-sm`}
      data-testid="tier-icon"
    >
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${tierColors?.bg || 'from-gray-100 to-gray-300'} opacity-60`}
        aria-hidden="true"
      />
      <div 
        className={`relative z-20 ${tierColors?.icon || 'text-gray-600'} ${iconSizeClasses[size]}`}
        aria-hidden="true"
      >
        {Icon}
      </div>
    </div>
  );
} 