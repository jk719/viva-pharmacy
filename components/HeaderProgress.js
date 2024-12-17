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
import Link from 'next/link';

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
    <AnimatePresence>
      <motion.div 
        className="w-full bg-white/95 backdrop-blur-sm border-b shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 py-3">
          {!session ? (
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-between gap-2 py-1 md:py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Mobile View */}
              <div className="flex md:hidden w-full items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#FF9F43] to-[#FFB976] shadow-md">
                    <FaGift className="text-white text-sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Join VIVA Rewards
                      </h3>
                      <div className="flex items-center gap-1">
                        <FaCoins className="text-[#FF9F43] text-[10px]" />
                        <span className="text-[10px] text-gray-600">$1 = 1 VIVAbuck</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      Get $5 off + 100 VIVAbucks
                    </p>
                  </div>
                </div>
                <Link
                  href="/register"
                  className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-medium 
                    hover:bg-primary/90 transition-all duration-200 shadow-sm
                    active:scale-95"
                >
                  Join
                </Link>
              </div>

              {/* Desktop View - Mobile-Inspired but More Descriptive */}
              <div className="hidden md:flex w-full items-center justify-between py-2">
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-[#FF9F43] to-[#FFB976] shadow-md">
                    <FaGift className="text-white text-xl" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Join VIVA Rewards Today
                      </h3>
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        <FaCoins className="text-[#FF9F43] text-sm" />
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          $1 spent = 1 VIVAbuck earned
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-0.5">
                      <div className="flex items-center gap-2">
                        <FaGift className="text-emerald-500 text-sm" />
                        <span className="text-sm text-gray-600">
                          Get $5 off your first purchase
                        </span>
                      </div>
                      <div className="h-3.5 w-px bg-gray-200" />
                      <div className="flex items-center gap-2">
                        <FaStar className="text-[#FF9F43] text-sm" />
                        <span className="text-sm text-gray-600">
                          Earn 100 bonus VIVAbucks instantly
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/register"
                  className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium 
                    hover:bg-primary/90 transition-all duration-200 shadow-md
                    active:scale-95 flex flex-col items-center -space-y-0.5"
                >
                  <span>Join Free</span>
                  <span className="text-[10px] opacity-75">Start Earning Now</span>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-3"
              layout
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="flex items-center justify-center w-10 h-10 rounded-xl 
                      bg-gradient-to-r from-[#FF9F43] to-[#FFB976] shadow-md"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaStar className="text-white text-lg" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        {REWARDS_CONFIG.formatPoints(currentPoints)}
                      </span>
                      <FaCoins className="text-[#FF9F43]" />
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500">Points Balance</span>
                      <div className="h-4 w-px bg-gray-200" />
                      <div className="flex items-center gap-1">
                        <FaStar className={`${tierColor}`} />
                        <span className="text-gray-500">
                          {rewardsData?.currentTier}
                        </span>
                      </div>
                      {availableReward > 0 && (
                        <motion.button
                          onClick={handleRewardClick}
                          className="flex items-center gap-1.5 ml-2 px-3 py-1 rounded-full
                            bg-emerald-50 text-emerald-600 font-medium
                            hover:bg-emerald-100 transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaGift className="text-emerald-500" />
                          <span>
                            {REWARDS_CONFIG.formatCurrency(availableReward)} Ready
                          </span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <motion.div 
                  className="h-6 bg-gray-100 rounded-xl overflow-hidden shadow-inner"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FF9F43] to-[#FFB976] rounded-xl"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <motion.div
                      className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2
                        flex items-center justify-center w-8 h-8 bg-white rounded-full
                        shadow-lg border-2 border-[#FFB976]"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -10, 10, 0],
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                    >
                      <span className="text-sm font-bold text-[#FF9F43]">
                        {currentProgressPoints}
                      </span>
                    </motion.div>
                  </motion.div>
                </motion.div>
                
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-xs text-gray-500">0</span>
                  <span className="text-xs text-gray-500">
                    {REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

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
    </AnimatePresence>
  );
}