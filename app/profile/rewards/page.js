"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TIER_CONFIG } from "@/lib/loyalty/tierConfig";
import { FaCrown, FaGem, FaMedal, FaStar, FaTrophy } from "react-icons/fa";

const tierIcons = {
  BRONZE: FaMedal,
  SILVER: FaStar,
  GOLD: FaTrophy,
  PLATINUM: FaGem,
  SAPPHIRE: FaGem,
  DIAMOND: FaGem,
  LEGEND: FaCrown,
};

const tierColors = {
  BRONZE: "from-amber-600 to-amber-800",
  SILVER: "from-gray-300 to-gray-500",
  GOLD: "from-yellow-400 to-yellow-600",
  PLATINUM: "from-gray-100 to-gray-300",
  SAPPHIRE: "from-blue-400 to-blue-600",
  DIAMOND: "from-purple-400 to-purple-600",
  LEGEND: "from-red-400 to-red-600",
};

export default function RewardsPage() {
  const { data: session } = useSession();
  const [currentTier, setCurrentTier] = useState(null);
  const [nextTier, setNextTier] = useState(null);

  useEffect(() => {
    if (session?.user?.loyaltyProgram) {
      const points = session.user.loyaltyProgram.points || 0;
      let currentTierSet = false;
      
      const tiers = Object.entries(TIER_CONFIG);
      for (let i = 0; i < tiers.length; i++) {
        const [tier, config] = tiers[i];
        if (points >= config.points) {
          setCurrentTier({ name: tier, ...config });
          currentTierSet = true;
          // Set next tier if available
          if (i < tiers.length - 1) {
            setNextTier({ name: tiers[i + 1][0], ...tiers[i + 1][1] });
          }
        }
      }
      
      if (!currentTierSet) {
        setCurrentTier({ name: 'BRONZE', ...TIER_CONFIG.BRONZE });
        setNextTier({ name: 'SILVER', ...TIER_CONFIG.SILVER });
      }
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white rounded-xl shadow-lg"
        >
          <FaCrown className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600">Please log in to view your rewards</p>
        </motion.div>
      </div>
    );
  }

  const TierCard = ({ tier, isActive }) => {
    const Icon = tierIcons[tier.name];
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`relative overflow-hidden rounded-xl shadow-lg ${
          isActive ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div className={`bg-gradient-to-r ${tierColors[tier.name]} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">{tier.name}</h3>
            <Icon className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <p className="text-lg opacity-90">Multiplier: {tier.multiplier}x</p>
            <p className="text-lg opacity-90">Coupon: ${tier.couponAmount}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Your VivaBucks Journey
          </h1>
          <p className="text-xl text-gray-600">
            Current Balance: {" "}
            <span className="font-bold text-blue-600">
              {session.user.loyaltyProgram?.points || 0} points
            </span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Current Tier Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-1"
          >
            <h2 className="text-xl font-semibold mb-4">Current Tier</h2>
            {currentTier && <TierCard tier={currentTier} isActive={true} />}
          </motion.div>

          {/* Next Tier Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-1"
          >
            <h2 className="text-xl font-semibold mb-4">Next Tier</h2>
            {nextTier && <TierCard tier={nextTier} isActive={false} />}
          </motion.div>

          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-1 md:col-span-2 lg:col-span-1"
          >
            <h2 className="text-xl font-semibold mb-4">Progress to Next Tier</h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              {nextTier && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{currentTier.name}</span>
                    <span>{nextTier.name}</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min((session.user.loyaltyProgram?.points / nextTier.points) * 100, 100)}%` 
                      }}
                      transition={{ duration: 1 }}
                      className={`h-full bg-gradient-to-r ${tierColors[nextTier.name]}`}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    {nextTier.points - (session.user.loyaltyProgram?.points || 0)} points needed
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* All Tiers Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-semibold mb-6">All Tiers Progress</h2>
          <div className="space-y-6">
            {Object.entries(TIER_CONFIG).map(([tier, config]) => {
              const points = session.user.loyaltyProgram?.points || 0;
              const progress = Math.min((points / config.points) * 100, 100);
              const Icon = tierIcons[tier];
              
              return (
                <div key={tier} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${progress === 100 ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={progress === 100 ? 'font-semibold' : ''}>{tier}</span>
                    </div>
                    <span>{points}/{config.points} points</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full bg-gradient-to-r ${tierColors[tier]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
