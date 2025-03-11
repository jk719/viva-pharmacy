'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { FaStar, FaGift, FaCoins } from 'react-icons/fa';
import { REWARDS_CONFIG } from '@/lib/rewards/config';
import { RewardsUtils } from '@/lib/rewards/utils';
import { Dialog } from '@headlessui/react';
import confetti from 'canvas-confetti';
import { useRewardsStore } from '@/lib/stores/rewardsStore';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { debounce } from 'lodash';
import { REWARD_CONSTANTS } from '@/lib/rewards/constants';

const logEvent = (eventName, data) => {
  console.log(`[HeaderProgress] ${eventName}:`, data);
};

const HeaderProgress = memo(function HeaderProgress() {
  console.log('HeaderProgress: Component rendering');
  const { data: session, status } = useSession();
  const [rewardsData, setRewardsData] = useState({
    vivaBucks: 0,
    currentTier: 'STANDARD',
    cumulativeVivaBucks: 0,
    availableVivaBucks: 0,
    rewardPoints: 0,
    cumulativePoints: 0
  });
  const [scale, setScale] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const { setActiveReward } = useRewardsStore();
  const ITEMS_PER_PAGE = 5;
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef([]);
  const [debugEvents, setDebugEvents] = useState([]);
  const mountedRef = useRef(true);
  const lastPaymentRef = useRef(null);
  const progressRef = useRef(0);
  const lastPointsRef = useRef(0);
  const initialRenderRef = useRef(true);
  const debouncedFetchRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastProcessedPaymentRef = useRef(null);

  // Add this at the top of the component
  const ANIMATION_DURATION = 1000;

  // Add state for tracking point updates
  const [pointUpdateQueue, setPointUpdateQueue] = useState([]);
  const lastFetchRef = useRef(Date.now());
  const FETCH_COOLDOWN = 2000; // 2 seconds cooldown between fetches

  // 1. Define calculateProgress first, before any other functions that use it
  const calculateProgress = useCallback((points) => {
    const pointsNeeded = REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED;
    const pointsInCycle = points % pointsNeeded;
    return (pointsInCycle / pointsNeeded) * 100;
  }, []);

  // 2. Then define fetchRewardsData which uses calculateProgress
  const fetchRewardsData = useCallback(async () => {
    if (!session?.user?.id || !mountedRef.current) return;

    try {
      const response = await fetch(`/api/user/vivabucks/${session.user.id}`);
      if (response.ok && mountedRef.current) {
        const data = await response.json();
        setRewardsData(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error('[HeaderProgress] Error fetching rewards data:', error);
    }
  }, [session?.user?.id]);

  // 3. Then define handleAnimation which also uses calculateProgress
  const handleAnimation = useCallback(async (amount) => {
    if (!session?.user?.id || !mountedRef.current) return;
    
    try {
      console.log('[HeaderProgress] Starting animation with amount:', amount);
      
      const currentPoints = rewardsData.rewardPoints || 0;
      const pointsToAdd = Math.floor(amount * REWARD_CONSTANTS.REWARD_RATE.POINTS_PER_DOLLAR);
      const newPoints = currentPoints + pointsToAdd;
      
      const progress = calculateProgress(newPoints);
      progressRef.current = progress;
      
      console.log('[HeaderProgress] Calculated progress:', {
        currentPoints,
        pointsToAdd,
        newPoints,
        progress
      });
      
      setScale(progress);
      lastPointsRef.current = newPoints;
      
      timeoutRef.current = setTimeout(async () => {
        if (mountedRef.current) {
          await fetchRewardsData();
        }
      }, 1000);
    } catch (error) {
      console.error('[HeaderProgress] Animation error:', error);
    }
  }, [session?.user?.id, rewardsData.rewardPoints, calculateProgress, fetchRewardsData]);

  // 4. Then define other functions and effects
  const updatePoints = useCallback(async (points) => {
    if (!session?.user?.id || !points) return;
    
    try {
      const response = await fetch(`/api/user/vivabucks/${session.user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          points: Math.floor(points),
          source: 'payment'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRewardsData(prev => ({
          ...prev,
          vivaBucks: data.vivaBucks,
          rewardPoints: data.rewardPoints,
          currentTier: data.currentTier,
          cumulativePoints: data.cumulativePoints
        }));
      } else {
        console.error('Failed to update points:', await response.text());
        // Retry once after a short delay
        setTimeout(() => updatePoints(points), 2000);
      }
    } catch (error) {
      console.error('Error updating points:', error);
      // Retry once after a short delay
      setTimeout(() => updatePoints(points), 2000);
    }
  }, [session?.user?.id]);

  // Add effect to handle point update queue
  useEffect(() => {
    if (pointUpdateQueue.length === 0) return;
    
    const updatePoints = async () => {
      try {
        const totalPoints = pointUpdateQueue.reduce((sum, points) => sum + points, 0);
        
        const response = await fetch(`/api/user/vivabucks/${session.user.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            points: totalPoints,
            source: 'payment'
          })
        });

        if (response.ok) {
          const data = await response.json();
          // Update state with server response
          setRewardsData(prev => ({
            ...prev,
            vivaBucks: data.vivaBucks,
            rewardPoints: data.rewardPoints,
            currentTier: data.currentTier,
            cumulativePoints: data.cumulativePoints || prev.cumulativePoints
          }));
        }
      } catch (error) {
        console.error('Error updating points:', error);
      } finally {
        setPointUpdateQueue([]); // Clear the queue
      }
    };

    // Debounce the points update
    const timeoutId = setTimeout(updatePoints, 1000);
    return () => clearTimeout(timeoutId);
  }, [pointUpdateQueue, session?.user?.id]);

  // Update the progress calculation
  const progress = useMemo(() => {
    const currentPoints = rewardsData.rewardPoints || 0;
    const pointsInCurrentCycle = currentPoints % REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED;
    return {
      currentPoints: pointsInCurrentCycle,
      totalPoints: currentPoints,
      progress: calculateProgress(currentPoints),
      pointsToNextReward: REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED - pointsInCurrentCycle,
      isAnimating
    };
  }, [rewardsData.rewardPoints, isAnimating, calculateProgress]);

  // Update the progress bar component
  const ProgressBar = () => (
    <div className="relative h-full">
      <motion.div
        className="absolute h-full bg-gradient-to-r from-[#FF9F43] to-[#FFB976] rounded-full"
        style={{ 
          width: `${Math.min(scale, 100)}%`,
          transformOrigin: 'left'
        }}
        initial={false}
        animate={{ 
          width: `${Math.min(scale, 100)}%`
        }}
        transition={{ 
          duration: 0.8,
          ease: "easeInOut"
        }}
      >
        <motion.div 
          className="absolute -right-2.5 top-1/2 -translate-y-1/2"
          animate={{
            scale: isAnimating ? [1, 1.2, 1] : 1
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
        >
          <div className="flex items-center justify-center w-5 h-5 
                       bg-white rounded-full border-2 border-[#FFB976]
                       shadow-lg">
            <span className="text-[10px] font-bold text-[#FF9F43]
                           transition-all duration-300 hover:text-orange-600">
              {Math.floor(progress.currentPoints)}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );

  // Update the points display component
  const PointsDisplay = () => (
    <motion.span 
      key={rewardsData.cumulativePoints}
      className="text-lg font-semibold text-gray-800"
      initial={{ scale: 0.95, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      {REWARDS_CONFIG.formatPoints(rewardsData.cumulativePoints)}
    </motion.span>
  );

  useEffect(() => {
    if (status !== 'authenticated') return;
    
    mountedRef.current = true;

    const handlePointsUpdate = (data) => {
      if (!mountedRef.current) return;
      logEvent('POINTS_UPDATED', data);
      handleAnimation(data);
    };

    const handlePaymentCompleted = (data) => {
      if (!mountedRef.current) return;
      logEvent('PAYMENT_COMPLETED', data);
      
      // Prevent duplicate processing
      if (lastProcessedPaymentRef.current === data.paymentIntentId) {
        logEvent('DUPLICATE_PAYMENT_SKIPPED', data.paymentIntentId);
        return;
      }
      
      lastProcessedPaymentRef.current = data.paymentIntentId;
      handleAnimation(data.amount);
    };

    // Initial fetch only when authenticated
    fetchRewardsData();

    // Set up event listeners
    eventEmitter.on(Events.POINTS_UPDATED, handlePointsUpdate);
    eventEmitter.on(Events.PAYMENT_COMPLETED, handlePaymentCompleted);

    return () => {
      mountedRef.current = false;
      if (animationTimeoutRef.current) {
        animationTimeoutRef.current.forEach(clearTimeout);
      }
      eventEmitter.off(Events.POINTS_UPDATED, handlePointsUpdate);
      eventEmitter.off(Events.PAYMENT_COMPLETED, handlePaymentCompleted);
      debouncedFetchRef.current?.cancel();
    };
  }, [fetchRewardsData, handleAnimation, status]);

  useEffect(() => {
    if (rewardsData?.availableVivaBucks) {
      setScale(REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED);
    }
  }, [rewardsData?.availableVivaBucks]);

  const currentVivaBucks = Math.floor(rewardsData?.rewardPoints || 0);
  const tierInfo = RewardsUtils.getMembershipTier(rewardsData?.cumulativePoints || 0);
  const availableReward = progress.availableReward;
  const tierColor = REWARDS_CONFIG.MEMBERSHIP_TIERS[rewardsData?.currentTier]?.color || 'text-gray-500';

  const currentProgressVivaBucks = progress.currentProgressPoints;
  const pointsToNextReward = progress.pointsToNextReward;
  const progressPercentage = progress.progress;

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

  // Only log state in development and when actually changed
  const prevState = useRef({ isAnimating, scale, progress: progressPercentage });
  useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
      const newState = { isAnimating, scale, progress: progressPercentage };
      if (JSON.stringify(prevState.current) !== JSON.stringify(newState)) {
        console.log('🔍 Current state:', newState);
        prevState.current = newState;
      }
    }
  }, [isAnimating, scale, progressPercentage]);

  // Update the effect to handle payment events
  useEffect(() => {
    if (!session?.user?.id) return;

    const handlePaymentCompleted = (data) => {
      if (!mountedRef.current) return;
      logEvent('PAYMENT_COMPLETED', data);
      handleAnimation(data);
    };

    eventEmitter.on(Events.PAYMENT_COMPLETED, handlePaymentCompleted);
    
    return () => {
      eventEmitter.off(Events.PAYMENT_COMPLETED, handlePaymentCompleted);
    };
  }, [session?.user?.id, handleAnimation]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        animationTimeoutRef.current.forEach(clearTimeout);
      }
    };
  }, []);

  // 5. Setup debounced fetch
  useEffect(() => {
    const debouncedFetch = debounce(fetchRewardsData, 300);
    
    debouncedFetchRef.current = debouncedFetch;

    return () => {
      debouncedFetchRef.current?.cancel();
    };
  }, [fetchRewardsData]);

  if (!session) {
    return (
      <div className="bg-white border-b">
        <div className="w-full bg-white border-b">
          <div className="w-full max-w-7xl mx-auto px-4 py-2">
            <div className="relative">
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
                      <span className="text-base font-semibold text-gray-800">Join & Get</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-emerald-600">$5 Welcome Bonus</span>
                        <span className="text-xs text-gray-500">+</span>
                        <span className="text-xs text-blue-600">100 VivaBucks</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/register"
                    className="flex items-center px-4 py-1.5 text-xs font-medium
                             bg-gradient-to-r from-[#FF9F43] to-[#FFB976] text-white
                             rounded-full shadow-md shadow-orange-200/50
                             hover:shadow-lg hover:scale-105
                             transition-all duration-200"
                  >
                    Join Now
                  </Link>
                </div>
                
                {/* Progress bar replacement for mobile */}
                <div className="relative">
                  <div className="h-5 bg-gradient-to-r from-gray-50 to-gray-100 
                                rounded-full overflow-hidden shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <FaCoins className="text-[#FF9F43] text-xs animate-pulse" />
                          <span className="text-[10px] md:text-xs font-medium text-gray-700">
                            100 VivaBucks
                          </span>
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-400">=</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] md:text-xs font-medium text-emerald-600">
                            $1 Reward
                          </span>
                          <FaGift className="text-emerald-500 text-xs animate-bounce-subtle" />
                        </div>
                      </div>
                      
                      <div className="hidden md:block w-px h-3 bg-gray-200"></div>
                      
                      <div className="flex items-center space-x-2">
                        <FaStar className="text-[#FF9F43] text-xs" />
                        <span className="text-[10px] md:text-xs font-medium text-gray-700">
                          Earn 1 VivaBuck per $1 spent
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:block">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full 
                                  bg-gradient-to-r from-[#FF9F43] to-[#FFB976] shadow-md
                                  hover:shadow-lg transition-all duration-300 animate-float">
                      <FaStar className="text-white text-lg" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-800">Join VivaBucks Rewards</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <FaGift className="text-emerald-500 text-xs" />
                          <span className="text-sm text-emerald-600 font-medium">$5 Welcome Bonus</span>
                        </div>
                        <span className="text-gray-400">+</span>
                        <div className="flex items-center space-x-1">
                          <FaCoins className="text-blue-500 text-xs" />
                          <span className="text-sm text-blue-600 font-medium">100 VivaBucks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-6 py-2 text-sm font-medium
                             bg-gradient-to-r from-[#FF9F43] to-[#FFB976] text-white
                             rounded-full shadow-lg shadow-orange-200/50
                             hover:shadow-xl hover:scale-105
                             transition-all duration-200"
                  >
                    Join Now
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>

                {/* Progress bar replacement for desktop */}
                <div className="relative">
                  <div className="h-5 bg-gradient-to-r from-gray-50 to-gray-100 
                                rounded-full overflow-hidden shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <FaCoins className="text-[#FF9F43] text-xs animate-pulse" />
                          <span className="text-[10px] md:text-xs font-medium text-gray-700">
                            100 VivaBucks
                          </span>
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-400">=</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] md:text-xs font-medium text-emerald-600">
                            $1 Reward
                          </span>
                          <FaGift className="text-emerald-500 text-xs animate-bounce-subtle" />
                        </div>
                      </div>
                      
                      <div className="hidden md:block w-px h-3 bg-gray-200"></div>
                      
                      <div className="flex items-center space-x-2">
                        <FaStar className="text-[#FF9F43] text-xs" />
                        <span className="text-[10px] md:text-xs font-medium text-gray-700">
                          Earn 1 VivaBuck per $1 spent
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b">
      <div className="w-full bg-white border-b">
        <div className="w-full max-w-7xl mx-auto px-4 py-2">
          <div className="relative">
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
                        {REWARDS_CONFIG.formatPoints(rewardsData.cumulativePoints)}
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
                          className="flex items-center space-x-2 border-l border-gray-200 pl-3 
                                    cursor-pointer rounded-full px-3 py-1.5 
                                    transition-all duration-300 ease-in-out group
                                    hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100
                                    hover:shadow-md hover:scale-105 active:scale-95 hover:border-emerald-200"
                        >
                          <div className="relative">
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 
                                          bg-gradient-to-r from-emerald-400 to-emerald-500 
                                          rounded-full animate-pulse"></div>
                            <FaGift className="text-emerald-500 text-sm 
                                           group-hover:scale-110 group-hover:rotate-12 
                                           transition-all duration-300" />
                          </div>
                          <span className="text-sm text-emerald-600 font-medium 
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
                      initial={{ width: 0, scale: 1 }}
                      animate={{ 
                        width: `${Math.min(progressPercentage, 100)}%`,
                        scale: isAnimating ? [0.8, 1.1, 1] : 1
                      }}
                      transition={{ 
                        width: {
                          duration: 0.8,
                          ease: [0.34, 1.56, 0.64, 1]
                        },
                        scale: {
                          duration: 0.6,
                          times: [0, 0.6, 1],
                          ease: "easeOut"
                        }
                      }}
                    >
                      {/* Progress indicator with enhanced animations */}
                      <div 
                        className="absolute -right-2.5 top-1/2 -translate-y-1/2"
                        animate={{
                          scale: isAnimating ? [1, 1.2, 1] : 1
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeInOut"
                        }}
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
                  <div className="flex items-center justify-center w-8 h-8 rounded-full 
                                bg-gradient-to-r from-[#FF9F43] to-[#FFB976] shadow-md
                                hover:shadow-lg transition-all duration-300 
                                hover:scale-110 group cursor-pointer">
                    <FaStar className="text-white text-lg 
                                    transition-transform duration-300
                                    group-hover:rotate-180" />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <motion.span 
                        className="text-lg font-semibold text-gray-800"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        {REWARDS_CONFIG.formatPoints(rewardsData.cumulativePoints)}
                      </motion.span>
                      <FaCoins className="text-[#FF9F43] text-sm animate-float" />
                    </div>

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

                      {availableReward > 0 && (
                        <div 
                          onClick={handleRewardClick}
                          className="flex items-center space-x-2 border-l border-gray-200 pl-3 
                                    cursor-pointer rounded-full px-4 py-2 
                                    transition-all duration-300 ease-in-out group
                                    hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100
                                    hover:shadow-md hover:scale-105 active:scale-95"
                        >
                          <div className="relative">
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 
                                          bg-emerald-400 rounded-full animate-ping"></div>
                            <FaGift className="text-emerald-500 text-base 
                                           group-hover:scale-110 group-hover:rotate-12 
                                           transition-all duration-300" />
                          </div>
                          <span className="text-base text-emerald-600 font-medium 
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
                      initial={{ width: 0, scale: 1 }}
                      animate={{ 
                        width: `${Math.min(progressPercentage, 100)}%`,
                        scale: isAnimating ? [0.8, 1.1, 1] : 1
                      }}
                      transition={{ 
                        width: {
                          duration: 0.8,
                          ease: [0.34, 1.56, 0.64, 1]
                        },
                        scale: {
                          duration: 0.6,
                          times: [0, 0.6, 1],
                          ease: "easeOut"
                        }
                      }}
                    >
                      {/* Animated progress indicator */}
                      <div 
                        className="absolute -right-2.5 top-1/2 -translate-y-1/2"
                        animate={{
                          scale: isAnimating ? [1, 1.2, 1] : 1
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeInOut"
                        }}
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
          </div>
        </div>
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

              <div className="space-y-4">
                {[...Array(Math.floor(availableReward / REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT))]
                  .slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
                  .map((_, index) => {
                  const actualIndex = currentPage * ITEMS_PER_PAGE + index;
                  const amount = (actualIndex + 1) * REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT;
                  return (
                    <motion.button 
                      key={actualIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleRewardRedeem(amount)}
                      className="flex items-center justify-between w-full px-6 py-4
                              rounded-xl border border-gray-200 
                              hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100
                              hover:border-emerald-200 hover:shadow-md
                              transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-4 min-w-[120px]">
                        <FaGift className="text-emerald-500 text-lg
                                       group-hover:scale-110 
                                       group-hover:rotate-12 transition-all duration-300" />
                        <span className="font-medium text-gray-700 text-base whitespace-nowrap">
                          {REWARDS_CONFIG.formatCurrency(amount)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 group-hover:text-gray-700 ml-4">
                        Redeem {amount/REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT} reward{amount > REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT ? 's' : ''}
                      </span>
                    </motion.button>
                  );
                })}

                {/* Pagination controls */}
                {Math.floor(availableReward / REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT) > ITEMS_PER_PAGE && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className={`px-4 py-2 text-sm rounded-lg transition-all duration-200
                                ${currentPage === 0 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-500">
                      Page {currentPage + 1} of {Math.ceil(Math.floor(availableReward / REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT) / ITEMS_PER_PAGE)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={((currentPage + 1) * ITEMS_PER_PAGE) >= Math.floor(availableReward / REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT)}
                      className={`px-4 py-2 text-sm rounded-lg transition-all duration-200
                                ${((currentPage + 1) * ITEMS_PER_PAGE) >= Math.floor(availableReward / REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT)
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                      Next
                    </button>
                  </div>
                )}
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
});

export default HeaderProgress;