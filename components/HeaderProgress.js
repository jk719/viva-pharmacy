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
    vivaBucks: 0,
    currentTier: 'STANDARD',
    cumulativeVivaBucks: 0,
    availableVivaBucks: 0,
    rewardPoints: 0,
    cumulativePoints: 0
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
        setRewardsData({
          vivaBucks: data.vivaBucks || 0,
          currentTier: data.currentTier || 'STANDARD',
          cumulativeVivaBucks: data.cumulativePoints || 0,
          availableVivaBucks: data.rewardPoints || 0,
          rewardPoints: data.rewardPoints || 0,
          cumulativePoints: data.cumulativePoints || 0
        });
      }
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchRewardsData();
    }
    
    const handleVivaBucksUpdate = () => {
      console.log('Points update event received');
      fetchRewardsData();
    };

    const handleVivaBucksReset = () => {
      setRewardsData({
        vivaBucks: 0,
        currentTier: 'STANDARD',
        cumulativeVivaBucks: 0,
        availableVivaBucks: 0,
        rewardPoints: 0,
        cumulativePoints: 0
      });
    };

    eventEmitter.on(Events.POINTS_UPDATED, handleVivaBucksUpdate);
    eventEmitter.on(Events.POINTS_RESET, handleVivaBucksReset);
    eventEmitter.on(Events.REWARD_RESTORED, handleVivaBucksUpdate);
    
    return () => {
      eventEmitter.off(Events.POINTS_UPDATED, handleVivaBucksUpdate);
      eventEmitter.off(Events.POINTS_RESET, handleVivaBucksReset);
      eventEmitter.off(Events.REWARD_RESTORED, handleVivaBucksUpdate);
    };
  }, [session]);

  useEffect(() => {
    if (rewardsData?.availableVivaBucks) {
      setScale(REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED);
    }
  }, [rewardsData?.availableVivaBucks]);

  useEffect(() => {
    const handleRewardRestored = () => {
      fetchRewardsData();
    };

    eventEmitter.on(Events.REWARD_RESTORED, handleRewardRestored);
    
    return () => {
      eventEmitter.off(Events.REWARD_RESTORED, handleRewardRestored);
    };
  }, []);

  const currentVivaBucks = rewardsData?.rewardPoints || 0;
  const vivaBucksToNextReward = REWARDS_CONFIG.getPointsToNextReward(currentVivaBucks);
  const availableReward = REWARDS_CONFIG.getRewardAmount(currentVivaBucks);
  const progress = (currentVivaBucks % REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED) / REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED * 100;
  const currentProgressVivaBucks = currentVivaBucks % REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED;
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
                <div className="flex items-center justify-center w-6 h-6 rounded-full 
                              bg-gradient-to-r from-[#FF9F43] to-[#FFB976] shadow-md
                              hover:shadow-lg transition-all duration-300 animate-float">
                  <FaStar className="text-white text-sm" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1">
                    <motion.span 
                      className="text-base font-semibold text-gray-800"
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      {REWARDS_CONFIG.formatPoints(currentVivaBucks)}
                    </motion.span>
                    <FaCoins className="text-[#FF9F43] text-xs animate-bounce-subtle" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 hover:text-gray-700 
                                  transition-colors duration-200">
                      Lifetime VivaBucks
                    </span>
                    <div className="flex items-center space-x-1 border-l border-gray-200 pl-2
                                 hover:border-orange-200 transition-colors duration-200">
                      <FaStar className={`text-[9px] ${tierColor} transition-colors duration-300`} />
                      <span className="text-[10px] text-gray-500 hover:text-gray-700
                                   transition-colors duration-200">
                        {rewardsData?.currentTier || 'STANDARD'}
                      </span>
                    </div>
                    {availableReward > 0 && (
                      <div 
                        onClick={handleRewardClick}
                        className="flex items-center space-x-1 border-l border-gray-200 pl-2 
                                cursor-pointer rounded-full px-2 py-0.5 
                                transition-all duration-300 ease-in-out group
                                hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100
                                hover:shadow-md hover:scale-105 
                                active:scale-95 hover:border-emerald-200"
                      >
                        <div className="relative">
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 
                                      bg-gradient-to-r from-emerald-400 to-emerald-500 
                                      rounded-full animate-pulse"></div>
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

            {/* Enhanced progress bar */}
            <div className="relative">
              <div className="h-5 bg-gradient-to-r from-gray-50 to-gray-100 
                            rounded-full overflow-hidden shadow-inner">
                <div className="relative h-full">
                  <motion.div
                    className="absolute h-full bg-gradient-to-r from-[#FF9F43] to-[#FFB976] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ 
                      duration: 0.8, 
                      ease: [0.34, 1.56, 0.64, 1]  // Custom spring-like easing
                    }}
                  >
                    {/* Progress indicator with enhanced animations */}
                    <div 
                      className="absolute -right-2.5 top-1/2 -translate-y-1/2
                               transition-transform duration-300 group-hover:scale-110"
                    >
                      <div className="flex items-center justify-center w-5 h-5 
                                       bg-white rounded-full border-2 border-[#FFB976]
                                       shadow-lg hover:shadow-xl
                                       transition-all duration-300 hover:scale-110">
                        <span className="text-[10px] font-bold text-[#FF9F43]
                                           transition-all duration-300 hover:text-orange-600">
                          {currentProgressVivaBucks}
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
                {/* Animated star icon */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full 
                              bg-gradient-to-r from-[#FF9F43] to-[#FFB976] shadow-md
                              hover:shadow-lg transition-all duration-300 
                              hover:scale-110 group cursor-pointer">
                  <FaStar className="text-white text-lg 
                                  transition-transform duration-300
                                  group-hover:rotate-180" />
                </div>

                <div className="flex flex-col">
                  {/* Points counter with animation */}
                  <div className="flex items-center space-x-2">
                    <motion.span 
                      className="text-lg font-semibold text-gray-800"
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      {REWARDS_CONFIG.formatPoints(currentVivaBucks)}
                    </motion.span>
                    <FaCoins className="text-[#FF9F43] text-sm animate-float" />
                  </div>

                  {/* Status info with hover effects */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 hover:text-gray-700 
                                  transition-colors duration-200">
                      Lifetime VivaBucks
                    </span>
                    <div className="flex items-center space-x-1 border-l border-gray-200 pl-2
                                 hover:border-orange-200 transition-all duration-200">
                      <FaStar className={`text-[11px] ${tierColor} transition-colors duration-300`} />
                      <span className="text-xs text-gray-500 hover:text-gray-700
                                   transition-colors duration-200">
                        {rewardsData?.currentTier || 'STANDARD'}
                      </span>
                    </div>

                    {/* Enhanced reward button */}
                    {availableReward > 0 && (
                      <div 
                        onClick={handleRewardClick}
                        className="flex items-center space-x-1 border-l border-gray-200 pl-2 
                                cursor-pointer rounded-full px-3 py-1
                                transition-all duration-300 ease-in-out group
                                hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100
                                hover:shadow-md hover:scale-105 active:scale-95"
                      >
                        <div className="relative">
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 
                                      bg-emerald-400 rounded-full animate-ping"></div>
                          <FaGift className="text-emerald-500 text-sm
                                         group-hover:scale-110 group-hover:rotate-12 
                                         transition-all duration-300" />
                        </div>
                        <span className="text-sm text-emerald-600 font-medium 
                                     group-hover:text-emerald-700
                                     transition-all duration-300">
                          {REWARDS_CONFIG.formatCurrency(availableReward)} Available
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced progress bar */}
            <div className="relative">
              <div className="h-5 bg-gradient-to-r from-gray-50 to-gray-100 
                            rounded-full overflow-hidden shadow-inner">
                <div className="relative h-full">
                  <motion.div
                    className="absolute h-full bg-gradient-to-r from-[#FF9F43] to-[#FFB976] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ 
                      duration: 0.8, 
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                  >
                    {/* Animated progress indicator */}
                    <div 
                      className="absolute -right-2.5 top-1/2 -translate-y-1/2
                               group transition-all duration-300"
                    >
                      <motion.div 
                        className="flex items-center justify-center w-5 h-5 
                                 bg-white rounded-full border-2 border-[#FFB976]
                                 shadow-lg hover:shadow-xl
                                 transition-all duration-300 hover:scale-110"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-[10px] font-bold text-[#FF9F43]">
                          {currentProgressVivaBucks}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Redemption Modal */}
      {isOpen && createPortal(
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-40"
        >
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true" 
          />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel 
              as={motion.div}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-xl
                        border border-gray-100"
            >
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Redeem Rewards
              </Dialog.Title>

              <div className="space-y-3">
                {[...Array(Math.floor(availableReward / REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT))].map((_, index) => {
                  const amount = (index + 1) * REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT;
                  return (
                    <motion.button 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleRewardRedeem(amount)}
                      className="flex items-center justify-between w-full px-4 py-3 
                              rounded-xl border border-gray-200 
                              hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100
                              hover:border-emerald-200 hover:shadow-md
                              transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-3">
                        <FaGift className="text-emerald-500 group-hover:scale-110 
                                       group-hover:rotate-12 transition-all duration-300" />
                        <span className="font-medium text-gray-700 group-hover:text-gray-900">
                          {REWARDS_CONFIG.formatCurrency(amount)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 group-hover:text-gray-700">
                        Redeem {amount/REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT} reward{amount > REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT ? 's' : ''}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(false)}
                className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 
                        py-2 rounded-lg hover:bg-gray-50
                        transition-colors duration-200"
              >
                Cancel
              </motion.button>
            </Dialog.Panel>
          </div>
        </Dialog>,
        document.getElementById('modal-root')
      )}

      {/* Success Animation Modal */}
      {isRedeeming && createPortal(
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40"
        >
          <div className="relative">
            {/* Background glow effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0, 0.15, 0.1] 
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute inset-0 bg-orange-400 rounded-full blur-3xl"
            />

            {/* Main reward animation container */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ 
                scale: 1,
                opacity: 1,
                y: 0
              }}
              transition={{ 
                type: "spring",
                duration: 0.6,
                bounce: 0.5
              }}
              className="relative flex flex-col items-center"
            >
              {/* Reward amount with floating animation */}
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ 
                  rotate: [10, -5, 0],
                  scale: [0.9, 1.1, 1],
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                className="bg-gradient-to-r from-[#FF9F43] to-[#FFB976] 
                          p-8 rounded-2xl shadow-2xl mb-6
                          border-2 border-white/20"
              >
                <span className="text-6xl font-bold text-white drop-shadow-lg">
                  {REWARDS_CONFIG.formatCurrency(redeemAmount)}
                </span>
              </motion.div>

              {/* Success message with staggered animation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center space-y-2"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    delay: 0.4,
                    bounce: 0.6
                  }}
                  className="text-4xl mb-2"
                >
                  🎉
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white text-xl font-medium text-center
                           bg-white/10 px-6 py-2 rounded-full backdrop-blur-sm
                           border border-white/20"
                >
                  Reward Redeemed!
                </motion.span>
              </motion.div>

              {/* Floating particles */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -inset-10 pointer-events-none"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      scale: 0,
                      x: 0,
                      y: 0
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.5],
                      x: Math.random() * 200 - 100,
                      y: Math.random() * -100 - 50
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                    className="absolute left-1/2 top-1/2 w-3 h-3
                             bg-orange-400 rounded-full blur-sm"
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>,
        document.getElementById('modal-root')
      )}
    </div>
  );
}