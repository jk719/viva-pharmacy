'use client';

import { useState } from 'react';
import { FaTrophy, FaStar, FaInfoCircle } from 'react-icons/fa';

/**
 * Component for displaying the user's loyalty tier progress and points
 * 
 * @param {Object} props Component properties
 * @param {number} props.cumulativeVivaBucks - Total cumulative VivaBucks earned
 * @param {number} props.pointsToNextTier - Points needed to reach next tier
 * @param {string} props.currentTier - Current tier name
 * @param {string} props.nextTier - Next tier name
 * @param {number} props.progress - Progress percentage to next tier (0-100)
 * @param {boolean} [props.showDetails=false] - Whether to show detailed information initially
 */
export default function TierPointsDisplay({
  cumulativeVivaBucks = 0,
  pointsToNextTier = 0,
  currentTier = 'BRONZE',
  nextTier = 'SILVER',
  progress = 0,
  showDetails = false
}) {
  const [detailsVisible, setDetailsVisible] = useState(showDetails);
  
  // Get tier color based on tier name
  const getTierColor = (tier) => {
    switch (tier.toUpperCase()) {
      case 'SILVER':
        return 'text-gray-400';
      case 'GOLD':
        return 'text-amber-500';
      case 'PLATINUM':
        return 'text-blue-400';
      case 'DIAMOND':
        return 'text-purple-500';
      case 'BRONZE':
      default:
        return 'text-amber-700';
    }
  };
  
  // Format points for display
  const formatPoints = (points) => {
    if (points >= 10000) {
      return `${(points / 1000).toFixed(1)}k`;
    }
    return points.toLocaleString();
  };
  
  // Get tier benefits description
  const getTierBenefits = (tier) => {
    switch (tier.toUpperCase()) {
      case 'SILVER':
        return '1.25x VivaBucks on purchases';
      case 'GOLD':
        return '1.5x VivaBucks on purchases';
      case 'PLATINUM':
        return '1.75x VivaBucks on purchases';
      case 'DIAMOND':
        return '2x VivaBucks on purchases';
      case 'BRONZE':
      default:
        return '1x VivaBucks on purchases';
    }
  };
  
  const currentTierColor = getTierColor(currentTier);
  const nextTierColor = getTierColor(nextTier);
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      {/* Header with toggle */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-gray-800 flex items-center">
          <FaTrophy className="text-amber-500 mr-2" />
          <span>Loyalty Progress</span>
        </h3>
        <button 
          onClick={() => setDetailsVisible(!detailsVisible)}
          className="text-blue-500 hover:text-blue-600 text-sm flex items-center"
        >
          <FaInfoCircle className="mr-1" />
          <span>{detailsVisible ? 'Hide Details' : 'Show Details'}</span>
        </button>
      </div>
      
      {/* Current status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className={`font-bold ${currentTierColor}`}>{currentTier}</span>
          <span className="mx-2 text-gray-400">→</span>
          <span className={`font-bold ${nextTierColor}`}>{nextTier}</span>
        </div>
        <div className="text-sm text-gray-500">
          {formatPoints(cumulativeVivaBucks)} total points
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Progress text */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{Math.round(progress)}% complete</span>
        <span>{formatPoints(pointsToNextTier)} more to {nextTier}</span>
      </div>
      
      {/* Expanded details */}
      {detailsVisible && (
        <div className="mt-4 border-t pt-3 text-sm">
          <h4 className="font-medium text-gray-700 mb-2">Current Benefits</h4>
          <div className="flex items-center text-gray-600 mb-3">
            <FaStar className={`${currentTierColor} mr-2`} />
            <span>{getTierBenefits(currentTier)}</span>
          </div>
          
          <h4 className="font-medium text-gray-700 mb-2">Next Tier Benefits</h4>
          <div className="flex items-center text-gray-600">
            <FaStar className={`${nextTierColor} mr-2`} />
            <span>{getTierBenefits(nextTier)}</span>
          </div>
        </div>
      )}
    </div>
  );
} 