'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import eventEmitter, { Events } from '@/lib/eventEmitter';
import Link from 'next/link';
import { FaStar, FaGift, FaCoins } from 'react-icons/fa';

const MILESTONES = [
  { points: 100, amount: 5 },
  { points: 200, amount: 15 },
  { points: 400, amount: 30 },
  { points: 600, amount: 50 },
  { points: 800, amount: 75 },
  { points: 1000, amount: 100 }
];

export default function HeaderProgress() {
  const { data: session } = useSession();
  const [rewardsData, setRewardsData] = useState(null);
  const [scale, setScale] = useState(100);

  const fetchRewardsData = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/user/vivabucks/${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRewardsData(data);
      }
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    }
  };

  useEffect(() => {
    fetchRewardsData();
    const handlePointsUpdate = () => fetchRewardsData();
    eventEmitter.addEventListener(Events.POINTS_UPDATED, handlePointsUpdate);
    return () => {
      eventEmitter.removeEventListener(Events.POINTS_UPDATED, handlePointsUpdate);
    };
  }, [session]);

  useEffect(() => {
    if (rewardsData?.rewardPoints) {
      const currentPoints = rewardsData.rewardPoints;
      const milestone = MILESTONES.find(m => m.points > currentPoints);
      if (milestone) {
        setScale(milestone.points);
      }
    }
  }, [rewardsData?.rewardPoints]);

  if (!rewardsData) return null;

  const currentPoints = rewardsData.rewardPoints || 0;
  const currentMilestone = MILESTONES.find(m => m.points > currentPoints) || MILESTONES[MILESTONES.length - 1];
  const progress = (currentPoints / scale) * 100;

  return (
    <div className="fixed w-full left-0 top-[175px] md:top-[65px] z-30 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-3 md:px-4 py-0.5">
        <motion.div 
          className="relative"
          layout
        >
          <Link href="/profile" className="block mb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#FF9F43] to-[#FFB976] shadow-lg">
                  <FaStar className="text-white text-lg" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-800">
                      {currentPoints}
                    </span>
                    <FaCoins className="text-[#FF9F43] text-sm" />
                  </div>
                  <span className="text-xs text-gray-600">
                    {rewardsData.currentTier}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FaGift className="text-[#FF9F43]" />
                <span>${currentMilestone.amount} at {currentMilestone.points}p</span>
              </div>
            </div>
          </Link>

          <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF9F43] to-[#FFB976] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
              }}
              style={{
                boxShadow: 'inset 0px 0px 8px rgba(255, 159, 67, 0.3)'
              }}
            />
          </div>

          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center space-x-1 text-xs md:text-sm text-gray-600">
              <FaCoins className="text-[#FF9F43] text-xs" />
              <span>0</span>
            </div>
            <div className="flex items-center space-x-1 text-xs md:text-sm text-gray-600">
              <FaCoins className="text-[#FF9F43] text-xs" />
              <span>{scale}</span>
            </div>
          </div>

          <div className="text-xs md:text-sm text-gray-600 mt-0.5 text-center flex items-center justify-center space-x-1">
            <FaGift className="text-[#FF9F43] text-xs" />
            <span>{currentMilestone.points - currentPoints} points to next reward</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}