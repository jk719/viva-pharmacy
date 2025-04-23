"use client";

import { useState, useEffect } from 'react';
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig';
import { TIER_ICONS } from '@/components/loyalty/constants/tierConfig';
import { calculateProgressToNextTier } from '@/lib/loyalty/loyaltyCalculator';
import { 
  FaCoins, 
  FaGift, 
  FaTrophy,
  FaArrowUp,
  FaCreditCard,
  FaTags
} from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function LoyaltyProgram({ user }) {
  const [progressData, setProgressData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const currentPoints = user.rewardHistory?.reduce((total, tx) => {
      if (tx.type === 'POINTS_EARNED') {
        return total + (tx.adjustedPoints ||.0);
      } else if (tx.type === 'REWARD_REDEEMED') {
        return total - (tx.pointsUsed || 0);
      }
      return total;
    }, 0) || 0;

    setProgressData(calculateProgressToNextTier(currentPoints, TIER_CONFIG));
    
    // Trigger animation when component mounts
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1500);
    
    return () => clearTimeout(timer);
  }, [user]);

  const currentTier = user.rewardHistory
    ?.filter(tx => tx.type === 'TIER_CHANGED')
    ?.pop()?.newTier || 'BRONZE';

  const currentPoints = user.rewardHistory?.reduce((total, tx) => {
    if (tx.type === 'POINTS_EARNED') {
      return total + (tx.adjustedPoints || 0);
    } else if (tx.type === 'REWARD_REDEEMED') {
      return total - (tx.pointsUsed || 0);
    }
    return total;
  }, 0) || 0;
  
  // Get available coupons
  const availableCoupons = user.coupons?.filter(coupon => !coupon.isUsed) || [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points Display Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center">
                <div className="bg-blue-500/10 p-2 rounded-lg mr-3">
                  <FaCoins className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Current Points</p>
                  <motion.p 
                    className="text-3xl font-bold text-primary mt-1"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {currentPoints.toLocaleString()}
                  </motion.p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
              <div className="mr-2">
                {TIER_ICONS[currentTier] || TIER_ICONS.BRONZE}
              </div>
              <span className="text-sm font-semibold">{currentTier}</span>
            </div>
          </div>
          
          {/* Progress bar */}
          {progressData && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-sm text-gray-600">
                  <FaArrowUp className="text-blue-500 mr-1 h-3 w-3" />
                  <span>Next: {progressData.nextTier}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {progressData.pointsNeeded.toLocaleString()} more points
                </div>
              </div>
              <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-blue-100">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 relative"
                  style={{ width: `${progressData.progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressData.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
        
        {/* Rewards Summary Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-500/10 p-2 rounded-lg mr-3">
              <FaGift className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Available Rewards</p>
          </div>
          
          {availableCoupons.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {availableCoupons.slice(0, 2).map((coupon, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-lg border border-indigo-100 p-3 flex justify-between items-center hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-indigo-500/10 p-1.5 rounded-lg mr-2">
                      <FaCreditCard className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">${coupon.amount} Off</p>
                      <p className="text-xs text-gray-500 mt-0.5">Code: {coupon.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-indigo-50 rounded-full px-2 py-1 text-xs text-indigo-700">
                    <FaTags className="h-3 w-3 mr-1" />
                    <span>
                      {new Date(coupon.expiryDate) > new Date() 
                        ? `Expires: ${new Date(coupon.expiryDate).toLocaleDateString()}`
                        : 'Expired'}
                    </span>
                  </div>
                </div>
              ))}
              
              {availableCoupons.length > 2 && (
                <div className="text-center text-sm text-indigo-600 mt-1">
                  +{availableCoupons.length - 2} more coupons available
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-indigo-100 p-4 text-center">
              <p className="text-gray-500">No rewards available yet</p>
              <p className="text-sm text-indigo-600 mt-1">Keep shopping to earn points!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Tiers Explanation */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="bg-slate-500/10 p-2 rounded-lg mr-3">
            <FaTrophy className="h-6 w-6 text-slate-600" />
          </div>
          <p className="text-sm text-gray-600 font-medium">Loyalty Tiers & Benefits</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map((tier) => (
            <div 
              key={tier}
              className={`rounded-lg p-3 border ${
                currentTier === tier 
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md' 
                  : 'bg-white/70 border-gray-100'
              }`}
            >
              <div className="flex justify-center mb-2">
                {TIER_ICONS[tier]}
              </div>
              <p className={`font-medium text-sm ${currentTier === tier ? 'text-blue-700' : 'text-gray-700'}`}>
                {tier}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {TIER_CONFIG[tier]?.multiplier}x Points
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 