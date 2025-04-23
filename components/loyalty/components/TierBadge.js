'use client';

import { TIER_COLORS } from '../constants/tierConfig';

/**
 * Badge component displaying a loyalty tier
 */
export default function TierBadge({ 
  tier = 'BRONZE',
  size = 'md',
  className = ''
}) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const tierColors = TIER_COLORS[tier] || TIER_COLORS.BRONZE;
  
  return (
    <div 
      className={`inline-flex items-center rounded-full ${sizeClasses[size]} ${tierColors?.background || 'bg-gray-100'} ${tierColors?.border || 'border-gray-200'} ${tierColors?.text || 'text-gray-700'} border font-medium ${className}`}
      data-testid="tier-badge"
    >
      <span className="whitespace-nowrap">
        {tier}
      </span>
    </div>
  );
}

/**
 * Skeleton loader for TierBadge
 */
export function TierBadgeSkeleton({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-16 h-6',
    md: 'w-20 h-8',
    lg: 'w-24 h-10'
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse`} 
      data-testid="tier-badge-skeleton"
      aria-hidden="true"
    />
  );
} 