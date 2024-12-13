'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

  return (
    <div className="w-full bg-white border-b">
      <div className="w-full max-w-7xl mx-auto px-4 py-3">
        <motion.div 
          className="relative"
          layout
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#FF9F43] to-[#FFB976] shadow-lg">
                <FaStar className="text-white text-lg" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-800">
                    {currentPoints.toLocaleString()}
                  </span>
                  <FaCoins className="text-[#FF9F43] text-sm" />
                </div>
                <span className="text-xs text-gray-600">
                  {rewardsData.currentTier}
                </span>
              </div>
            </div>

            {/* Centered reward badge */}
            {availableReward > 0 && (
              <div className="mx-4">
                <button 
                  onClick={() => setIsOpen(true)}
                  className="flex items-center justify-center h-7 md:h-8 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-md group hover:from-emerald-600 hover:to-emerald-500 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-center px-2 md:px-3.5 space-x-1.5 md:space-x-2">
                    <FaGift className="text-white text-xs md:text-sm" />
                    <span className="text-white font-semibold text-xs md:text-sm whitespace-nowrap">
                      $10
                    </span>
                    {availableReward >= 20 && (
                      <div className="flex items-center border-l border-white/30 pl-1.5 md:pl-2 ml-0.5 md:ml-1">
                        <span className="text-white/90 text-[10px] md:text-xs font-medium">
                          {Math.floor(availableReward / 10)}
                          <span className="hidden md:inline"> available</span>
                          <span className="inline md:hidden">x</span>
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaCoins className="text-[#FF9F43]" />
              <span>{pointsToNextReward} to next reward</span>
            </div>
          </div>

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
              <span>{REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED}</span>
            </div>
          </div>

          <div className="text-xs md:text-sm text-gray-600 mt-0.5 text-center flex items-center justify-center space-x-1">
            <FaGift className="text-[#FF9F43] text-xs" />
            <span>{pointsToNextReward} points to next reward</span>
          </div>
        </motion.div>
      </div>

      {isOpen && createPortal(
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-40"
        >
          <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Select Reward Amount
              </Dialog.Title>

              <div className="space-y-3">
                {[...Array(Math.min(3, Math.floor(availableReward / 10) - (currentPage * 3)))].map((_, index) => {
                  const rewardIndex = currentPage * 3 + index;
                  const rewardAmount = (rewardIndex + 1) * 10;
                  return (
                    <button 
                      key={rewardIndex}
                      onClick={() => {
                        setRedeemAmount(rewardAmount);
                        setIsRedeeming(true);
                        setActiveReward(rewardAmount);
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
                      }}
                      className="flex items-center justify-between w-full px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FaGift className="text-emerald-500" />
                        <span className="font-medium">${rewardAmount}</span>
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        Redeem {rewardIndex + 1} rewards
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors
                    ${currentPage === 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-emerald-600'
                    }`}
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  {currentPage + 1} of {Math.ceil(Math.floor(availableReward / 10) / 3)}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(Math.floor(availableReward / 10) / 3) - 1}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors
                    ${currentPage >= Math.ceil(Math.floor(availableReward / 10) / 3) - 1
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-emerald-600'
                    }`}
                >
                  Next
                </button>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setCurrentPage(0);
                }}
                className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>,
        document.getElementById('modal-root')
      )}

      {isRedeeming && createPortal(
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-40">
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