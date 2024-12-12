'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import eventEmitter, { Events } from '@/lib/eventEmitter';
import Link from 'next/link';

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
    <div className="fixed w-full left-0 top-[180px] md:top-[80px] z-30 bg-white shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-3 md:px-4 py-0.5">
        <motion.div 
          className="relative"
          layout
        >
          {/* Points Display */}
          <Link href="/profile" className="block mb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🌟</span>
                <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {currentPoints} Points
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  ({rewardsData.currentTier})
                </span>
              </div>
              <div className="text-sm text-gray-600">
                ${currentMilestone.amount} at {currentMilestone.points}p
              </div>
            </div>
          </Link>

          {/* Progress Bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
              }}
            />
          </div>

          <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-1">
            <span>0p</span>
            <span>{scale}p</span>
          </div>

          <div className="text-xs md:text-sm text-gray-500 mt-0.5 text-center">
            {currentMilestone.points - currentPoints} points to next reward
          </div>
        </motion.div>
      </div>
    </div>
  );
}