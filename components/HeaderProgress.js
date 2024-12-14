'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { FaStar, FaGift, FaCoins } from 'react-icons/fa';
import { REWARDS_CONFIG } from '@/lib/rewards/config';
import { Dialog } from '@headlessui/react';
import confetti from 'canvas-confetti';
import { useRewardsStore } from '@/lib/stores/rewardsStore';
import { createPortal } from 'react-dom';

export default function HeaderProgress() {
  const { data: session } = useSession();
  const [rewardsData, setRewardsData] = useState({
    rewardPoints: 0,
    currentTier: 'STANDARD'
  });
  const [scale, setScale] = useState(100);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const { setActiveReward } = useRewardsStore();

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
    const handlePointsReset = () => {
      setRewardsData(null);
      fetchRewardsData();
    };

    eventEmitter.on(Events.POINTS_UPDATED, handlePointsUpdate);
    eventEmitter.on(Events.POINTS_RESET, handlePointsReset);
    
    return () => {
      eventEmitter.off(Events.POINTS_UPDATED, handlePointsUpdate);
      eventEmitter.off(Events.POINTS_RESET, handlePointsReset);
    };
  }, [session]);

  useEffect(() => {
    if (rewardsData?.rewardPoints) {
      setScale(REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED);
    }
  }, [rewardsData?.rewardPoints]);

  const currentPoints = rewardsData?.rewardPoints || 0;
  const pointsToNextReward = REWARDS_CONFIG.getPointsToNextReward(currentPoints);
  const availableReward = REWARDS_CONFIG.getRewardAmount(currentPoints);
  const progress = (currentPoints % REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED) / REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED * 100;
  const currentProgressPoints = currentPoints % REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED;

  const handleRewardClick = () => {
    if (availableReward > 0) {
      setIsOpen(true);
    }
  };

  const handleRewardRedeem = (amount) => {
    setRedeemAmount(amount);
    setIsRedeeming(true);
    setActiveReward(amount);
    setIsOpen(false);
    setCurrentPage(0);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#6EE7B7', '#FFB976', '#FF9F43']
    });

    setTimeout(() => {
      setIsRedeeming(false);
    }, 2000);
  };

  return (
    <div className="w-full bg-white border-b">
      <div className="w-full max-w-7xl mx-auto px-4 py-2">
        <motion.div className="relative" layout>
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-[#FF9F43] to-[#FFB976] shadow-md">
                  <FaStar className="text-white text-sm" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1">
                    <span className="text-base font-semibold text-gray-800">
                      {currentPoints.toLocaleString()}
                    </span>
                    <FaCoins className="text-[#FF9F43] text-xs" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-gray-500">
                      Lifetime Points
                    </span>
                    <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
                      <FaStar className="text-[#FF9F43] text-[9px]" />
                      <span className="text-[10px] text-gray-500">
                        {rewardsData.currentTier}
                      </span>
                    </div>
                    {availableReward > 0 && (
                      <div 
                        onClick={handleRewardClick}
                        className="flex items-center space-x-1 border-l border-gray-200 pl-2 
                          cursor-pointer rounded-full px-2 py-0.5 
                          transition-all duration-300 ease-in-out group
                          hover:bg-emerald-50 hover:shadow-sm hover:scale-105 
                          active:scale-95 hover:border-emerald-200"
                      >
                        <div className="relative">
                          {/* Ping animation */}
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full 
                            animate-ping opacity-75"></div>
                          <FaGift className="text-emerald-500 text-[9px] 
                            group-hover:scale-110 group-hover:rotate-12 
                            transition-all duration-300" />
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium 
                          group-hover:text-emerald-700 group-hover:font-semibold
                          transition-all duration-300">
                          ${availableReward} Available
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar with reward circle */}
            <div className="relative">
              <div className="h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div className="relative h-full">
                  <motion.div
                    className="absolute h-full bg-gradient-to-r from-[#FF9F43] to-[#FFB976] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    {/* Circular points at the tip */}
                    <div 
                      className="absolute -right-2.5 top-1/2 -translate-y-1/2"
                      style={{ 
                        filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))'
                      }}
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full border border-[#FFB976]">
                        <span className="text-[10px] font-bold text-[#FF9F43]">
                          {currentProgressPoints}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#FF9F43] to-[#FFB976] shadow-md">
                  <FaStar className="text-white text-lg" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-800">
                      {currentPoints.toLocaleString()}
                    </span>
                    <FaCoins className="text-[#FF9F43] text-sm" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      Lifetime Points
                    </span>
                    <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
                      <FaStar className="text-[#FF9F43] text-[11px]" />
                      <span className="text-xs text-gray-500">
                        {rewardsData.currentTier}
                      </span>
                    </div>
                    {availableReward > 0 && (
                      <div 
                        onClick={handleRewardClick}
                        className="flex items-center space-x-1 border-l border-gray-200 pl-2 
                          cursor-pointer rounded-full px-2 py-0.5 
                          transition-all duration-300 ease-in-out group
                          hover:bg-emerald-50 hover:shadow-sm hover:scale-105 
                          active:scale-95 hover:border-emerald-200"
                      >
                        <div className="relative">
                          {/* Ping animation */}
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full 
                            animate-ping opacity-75"></div>
                          <FaGift className="text-emerald-500 text-[9px] 
                            group-hover:scale-110 group-hover:rotate-12 
                            transition-all duration-300" />
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium 
                          group-hover:text-emerald-700 group-hover:font-semibold
                          transition-all duration-300">
                          ${availableReward} Available
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar with reward circle */}
            <div className="relative">
              <div className="h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div className="relative h-full">
                  <motion.div
                    className="absolute h-full bg-gradient-to-r from-[#FF9F43] to-[#FFB976] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    {/* Circular points at the tip */}
                    <div 
                      className="absolute -right-2.5 top-1/2 -translate-y-1/2"
                      style={{ 
                        filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))'
                      }}
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full border border-[#FFB976]">
                        <span className="text-[10px] font-bold text-[#FF9F43]">
                          {currentProgressPoints}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Redemption Modal */}
      {isOpen && createPortal(
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-40"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Redeem Rewards
              </Dialog.Title>

              <div className="space-y-3">
                {[...Array(Math.floor(availableReward / 10))].map((_, index) => {
                  const amount = (index + 1) * 10;
                  return (
                    <button 
                      key={index}
                      onClick={() => handleRewardRedeem(amount)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FaGift className="text-emerald-500" />
                        <span className="font-medium">${amount}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Redeem {amount/10} reward{amount > 10 ? 's' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>,
        document.getElementById('modal-root')
      )}

      {/* Success Animation */}
      {isRedeeming && createPortal(
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 0 }}
            animate={{ 
              scale: [0.5, 1.1, 1],
              opacity: [0, 1, 1],
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 1.8,
              times: [0, 0.5, 0.8],
              ease: "easeOut"
            }}
            className="flex flex-col items-center justify-center absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ 
                rotate: [10, -5, 0],
                scale: [0.9, 1.1, 1]
              }}
              transition={{
                duration: 0.5,
                times: [0, 0.6, 1],
                ease: "easeOut"
              }}
              className="bg-gradient-to-r from-[#FF9F43] to-[#FFB976] p-8 rounded-2xl shadow-lg mb-4"
            >
              <span className="text-6xl font-bold text-white">
                ${redeemAmount}
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-xl font-medium text-center"
            >
              🎉 Reward Redeemed! 
            </motion.div>
          </motion.div>
        </div>,
        document.getElementById('modal-root')
      )}
    </div>
  );
}