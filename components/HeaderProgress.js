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
    currentTier: 'STANDARD',
    cumulativePoints: 0,
    vivaBucks: 0
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
      setRewardsData({
        rewardPoints: 0,
        currentTier: 'STANDARD',
        cumulativePoints: 0,
        vivaBucks: 0
      });
    };

    eventEmitter.on(Events.POINTS_UPDATED, handlePointsUpdate);
    eventEmitter.on(Events.POINTS_RESET, handlePointsReset);
    eventEmitter.on(Events.REWARD_RESTORED, handlePointsUpdate);
    
    return () => {
      eventEmitter.off(Events.POINTS_UPDATED, handlePointsUpdate);
      eventEmitter.off(Events.POINTS_RESET, handlePointsReset);
      eventEmitter.off(Events.REWARD_RESTORED, handlePointsUpdate);
    };
  }, [session]);

  useEffect(() => {
    if (rewardsData?.rewardPoints) {
      setScale(REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED);
    }
  }, [rewardsData?.rewardPoints]);

  useEffect(() => {
    const handleRewardRestored = () => {
      fetchRewardsData();
    };

    eventEmitter.on(Events.REWARD_RESTORED, handleRewardRestored);
    
    return () => {
      eventEmitter.off(Events.REWARD_RESTORED, handleRewardRestored);
    };
  }, []);

  const currentPoints = rewardsData?.rewardPoints || 0;
  const pointsToNextReward = REWARDS_CONFIG.getPointsToNextReward(currentPoints);
  const availableReward = REWARDS_CONFIG.getRewardAmount(currentPoints);
  const progress = (currentPoints % REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED) / REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED * 100;
  const currentProgressPoints = currentPoints % REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED;
  const tierColor = REWARDS_CONFIG.MEMBERSHIP_TIERS[rewardsData?.currentTier]?.color || 'text-gray-500';

  const handleRewardClick = () => {
    if (availableReward > 0) {
      setIsOpen(true);
    }
  };

  const handleRewardRedeem = async (amount) => {
    try {
      const response = await fetch(`/api/user/vivabucks/${session.user.id}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        setRedeemAmount(amount);
        setIsRedeeming(true);
        
        const currentActiveReward = useRewardsStore.getState().activeReward || 0;
        setActiveReward(currentActiveReward + amount);
        
        setIsOpen(false);
        setCurrentPage(0);
        
        eventEmitter.emit(Events.REWARD_REDEEMED);
        eventEmitter.emit(Events.POINTS_UPDATED);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#6EE7B7', '#FFB976', '#FF9F43']
        });

        await fetchRewardsData();
        
        setTimeout(() => {
          setIsRedeeming(false);
        }, 2000);
      } else {
        console.error('Failed to redeem reward');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
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
                      {REWARDS_CONFIG.formatPoints(currentPoints)}
                    </span>
                    <FaCoins className="text-[#FF9F43] text-xs" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-gray-500">
                      Lifetime Points
                    </span>
                    <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
                      <FaStar className={`text-[9px] ${tierColor}`} />
                      <span className="text-[10px] text-gray-500">
                        {rewardsData?.currentTier || 'STANDARD'}
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
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full 
                            animate-ping opacity-75"></div>
                          <FaGift className="text-emerald-500 text-[9px] 
                            group-hover:scale-110 group-hover:rotate-12 
                            transition-all duration-300" />
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium 
                          group-hover:text-emerald-700 group-hover:font-semibold
                          transition-all duration-300">
                          {REWARDS_CONFIG.formatCurrency(availableReward)} Available
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
                      {REWARDS_CONFIG.formatPoints(currentPoints)}
                    </span>
                    <FaCoins className="text-[#FF9F43] text-sm" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      Lifetime Points
                    </span>
                    <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
                      <FaStar className={`text-[11px] ${tierColor}`} />
                      <span className="text-xs text-gray-500">
                        {rewardsData?.currentTier || 'STANDARD'}
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
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full 
                            animate-ping opacity-75"></div>
                          <FaGift className="text-emerald-500 text-[9px] 
                            group-hover:scale-110 group-hover:rotate-12 
                            transition-all duration-300" />
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium 
                          group-hover:text-emerald-700 group-hover:font-semibold
                          transition-all duration-300">
                          {REWARDS_CONFIG.formatCurrency(availableReward)} Available
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
                {[...Array(Math.floor(availableReward / REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT))].map((_, index) => {
                  const amount = (index + 1) * REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT;
                  return (
                    <button 
                      key={index}
                      onClick={() => handleRewardRedeem(amount)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FaGift className="text-emerald-500" />
                        <span className="font-medium">{REWARDS_CONFIG.formatCurrency(amount)}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Redeem {amount/REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT} reward{amount > REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT ? 's' : ''}
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
                {REWARDS_CONFIG.formatCurrency(redeemAmount)}
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