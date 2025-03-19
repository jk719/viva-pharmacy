"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from 'react';
import { 
  FaCrown, FaMedal, FaGem, FaSpinner, FaSync, FaStar, FaTrophy, FaCoins, FaAngleRight
} from 'react-icons/fa';
import { Events, eventEmitter } from '@/lib/eventEmitter';
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig';
import { calculateProgressToNextTier } from '@/lib/loyalty/loyaltyCalculator';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Modern tier icons with consistent styling
const TIER_ICONS = {
  BRONZE: <FaMedal className="text-[#CD7F32] w-6 h-6" />,
  SILVER: <FaStar className="text-[#C0C0C0] w-6 h-6" />,
  GOLD: <FaTrophy className="text-[#FFD700] w-6 h-6" />,
  PLATINUM: <FaGem className="text-[#E5E4E2] w-6 h-6" />,
  SAPPHIRE: <FaGem className="text-[#0F52BA] w-6 h-6" />,
  DIAMOND: <FaGem className="text-[#B9F2FF] w-6 h-6" />,
  LEGEND: <FaCrown className="text-[#FFD700] w-6 h-6" />
};

// Tier background gradients for visual appeal
const TIER_GRADIENTS = {
  BRONZE: "from-amber-600 to-amber-800",
  SILVER: "from-gray-300 to-gray-500",
  GOLD: "from-yellow-400 to-yellow-600",
  PLATINUM: "from-gray-100 to-gray-300",
  SAPPHIRE: "from-blue-400 to-blue-600",
  DIAMOND: "from-purple-400 to-purple-600",
  LEGEND: "from-red-400 to-red-600",
};

export default function LoyaltyBanner() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const progressBarRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [progressInfo, setProgressInfo] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [animatePoints, setAnimatePoints] = useState(false);
  const pollingIntervalRef = useRef(null);
  const paymentEventTimeoutRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const previousPointsRef = useRef(null);
  
  // Set mounted state
  useEffect(() => {
    setMounted(true);
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (paymentEventTimeoutRef.current) {
        clearTimeout(paymentEventTimeoutRef.current);
      }
    };
  }, []);

  // Function to fetch user data using fetch directly with no-store
  const fetchUserDataFresh = async (showRefreshIndicator = false) => {
    if (!session?.user?.id) return null;
    
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }
    
    try {
      // Build URL with cache-busting parameters
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const url = `/api/user/profile?nocache=${timestamp}&r=${random}`;
      
      // Create a fresh request with cache control headers
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setLastUpdated(Date.now());
      
      // Check if this is the first load or if points have changed
      if (isFirstLoadRef.current) {
        previousPointsRef.current = {
          vivaBucks: data.vivaBucks,
          cumulativePoints: data.cumulativePoints
        };
        isFirstLoadRef.current = false;
      } else if (
        previousPointsRef.current && 
        (previousPointsRef.current.vivaBucks !== data.vivaBucks || 
         previousPointsRef.current.cumulativePoints !== data.cumulativePoints)
      ) {
        // Points have changed, trigger animation
        setAnimatePoints(true);
        // Log the difference
        console.log('🎯 Points updated:', {
          vivaBucks: {
            previous: previousPointsRef.current.vivaBucks,
            current: data.vivaBucks,
            difference: data.vivaBucks - previousPointsRef.current.vivaBucks
          },
          cumulativePoints: {
            previous: previousPointsRef.current.cumulativePoints,
            current: data.cumulativePoints,
            difference: data.cumulativePoints - previousPointsRef.current.cumulativePoints
          }
        });
        
        // Animate progress bar
        if (progressBarRef.current) {
          progressBarRef.current.classList.add('animate-pulse');
          setTimeout(() => {
            if (progressBarRef.current) {
              progressBarRef.current.classList.remove('animate-pulse');
            }
          }, 3000);
        }
        
        // Update the previous points reference
        previousPointsRef.current = {
          vivaBucks: data.vivaBucks,
          cumulativePoints: data.cumulativePoints
        };
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      
      // Reset animation after a delay
      if (animatePoints) {
        setTimeout(() => setAnimatePoints(false), 3000);
      }
    }
  };

  // Function to update user data and progress info
  const updateUserData = async (forceFetch = false) => {
    // Skip if already refreshing or if refresh was requested within the last 2 seconds (unless forced)
    if (isRefreshing || (!forceFetch && Date.now() - lastUpdated < 2000)) {
      return;
    }
    
    const data = await fetchUserDataFresh(forceFetch);
    if (!data) return;
    
    // Update user data
    setUserData(data);
    
    // Calculate progress info
    if (data.cumulativePoints && typeof data.cumulativePoints === 'number') {
      try {
        const progress = calculateProgressToNextTier(data.cumulativePoints, TIER_CONFIG);
        setProgressInfo(progress);
      } catch (err) {
        console.error('Error calculating tier progress:', err);
      }
    }
  };

  // Initial data fetch when session is available
  useEffect(() => {
    if (session?.user?.id) {
      updateUserData(true);
    }
  }, [session]);

  // Set up aggressive polling interval to check for updates
  useEffect(() => {
    if (!session?.user?.id) return;
    
    // Initial load
    updateUserData(true);
    
    // Set up interval with a random delay to avoid request clustering
    const randomDelay = Math.floor(Math.random() * 1000) + 2000; // 2-3 seconds
    pollingIntervalRef.current = setInterval(() => {
      updateUserData();
    }, randomDelay);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [session]);

  // Reset animation flag after animation completes
  useEffect(() => {
    if (animatePoints) {
      const timer = setTimeout(() => {
        setAnimatePoints(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [animatePoints]);

  // Listen for payment events
  useEffect(() => {
    const handlePaymentComplete = (data) => {
      console.log('💰 Payment completed event detected in LoyaltyBanner:', data);
      
      // Force immediate update
      updateUserData(true);
      
      // Schedule multiple follow-up refreshes to ensure we catch the update
      // as it may take time for the database to be updated
      if (paymentEventTimeoutRef.current) {
        clearTimeout(paymentEventTimeoutRef.current);
      }
      
      paymentEventTimeoutRef.current = setTimeout(() => {
        updateUserData(true);
        
        // Try again after a bit more time if needed
        paymentEventTimeoutRef.current = setTimeout(() => {
          updateUserData(true);
        }, 3000);
      }, 2000);
    };

    eventEmitter.on(Events.PAYMENT_COMPLETED, handlePaymentComplete);
    return () => {
      eventEmitter.off(Events.PAYMENT_COMPLETED, handlePaymentComplete);
      if (paymentEventTimeoutRef.current) {
        clearTimeout(paymentEventTimeoutRef.current);
      }
    };
  }, []);

  // Manual refresh handler
  const handleManualRefresh = () => {
    updateUserData(true);
  };

  if (!mounted || status === "loading" || !session) return null;

  // Extract values with fallbacks
  const currentVivaBucks = userData?.vivaBucks ?? 0;
  const lifetimeVivaBucks = userData?.cumulativePoints ?? 0;
  const currentTier = userData?.currentTier || 'BRONZE';
  
  // Get progress data with fallbacks
  const nextTierName = progressInfo?.nextTier ?? 'SILVER';
  const progressPercent = progressInfo?.progress ?? 0;
  const pointsNeeded = progressInfo?.pointsNeeded ?? 0;
  const currentPoints = progressInfo?.currentPoints ?? lifetimeVivaBucks;
  const pointsThreshold = progressInfo?.pointsThreshold ?? (TIER_CONFIG[nextTierName]?.points || 1000);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-2 px-4 md:px-6 flex flex-wrap justify-between items-center shadow-md"
    >
      {userData ? (
        <>
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="hidden md:flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-800 to-blue-700 rounded-full shadow-inner p-2">
              {TIER_ICONS[currentTier] || TIER_ICONS.BRONZE}
            </div>
            <div>
              <motion.h3 
                className="text-xs md:text-sm font-bold tracking-wider uppercase"
                animate={{ color: animatePoints ? '#FFD700' : '#ffffff' }}
                transition={{ duration: 0.5 }}
              >
                {currentTier} MEMBER
              </motion.h3>
              <div className="flex items-baseline space-x-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentVivaBucks}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center"
                  >
                    <FaCoins className={`mr-1 h-4 w-4 ${animatePoints ? 'text-yellow-300' : 'text-yellow-400'}`} />
                    <span className={`text-lg md:text-xl font-bold transition-all duration-500 ${animatePoints ? 'text-yellow-300 scale-110' : ''}`}>
                      {currentVivaBucks.toLocaleString()}
                    </span>
                  </motion.div>
                </AnimatePresence>
                <span className="text-xs text-blue-200">Available</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={lifetimeVivaBucks}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`text-sm md:text-base font-medium transition-all duration-500 ${animatePoints ? 'text-yellow-300' : ''}`}
                  >
                    {lifetimeVivaBucks.toLocaleString()}
                  </motion.span>
                </AnimatePresence>
                <span className="text-xs text-blue-200">Lifetime</span>
              </div>
            </div>
          </div>

          {progressInfo && (
            <div className="mt-2 md:mt-0 w-full md:w-auto md:flex-1 md:mx-6 max-w-sm">
              <div className="flex justify-between text-xs mb-1 text-blue-200">
                <span className="flex items-center">
                  Progress to {nextTierName}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-1"
                  >
                    {TIER_ICONS[nextTierName]}
                  </motion.div>
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${currentPoints}-${pointsThreshold}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {currentPoints.toLocaleString()} / {pointsThreshold.toLocaleString()}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div 
                ref={progressBarRef}
                className="w-full bg-blue-900/80 rounded-full h-4 p-0.5 shadow-inner"
              >
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                  className={`h-full relative rounded-full overflow-hidden bg-gradient-to-r ${animatePoints ? 'from-orange-400 to-orange-500' : 'from-orange-500 to-orange-600'} transition-all duration-300`}
                >
                  {/* Shimmer effect inside progress bar */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </motion.div>
              </div>
              <div className="text-xs mt-1 text-blue-200 flex justify-between items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pointsNeeded}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    className="flex items-center"
                  >
                    <span>{pointsNeeded.toLocaleString()} more needed</span>
                  </motion.div>
                </AnimatePresence>
                
                {/* Multiplier badge */}
                <div className="hidden md:flex items-center bg-blue-800/70 rounded-full px-2 py-0.5 text-xs">
                  <FaCoins className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="font-medium">{TIER_CONFIG[currentTier]?.multiplier || 1}x Multiplier</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white shadow-lg"
              title="Refresh points"
            >
              <FaSync className={isRefreshing ? "animate-spin" : ""} size={16} />
            </motion.button>
            <Link
              href="/profile/rewards"
              className="hidden md:flex items-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-4 py-2 rounded-full text-sm transition-all duration-300 shadow-lg font-medium"
            >
              <span>View Rewards</span>
              <FaAngleRight className="ml-1" />
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center w-full py-2 flex flex-col justify-center items-center">
          <FaSpinner className="animate-spin text-white mb-2" size={24} />
          <span className="text-xs text-blue-200">Loading rewards...</span>
        </div>
      )}
    </motion.div>
  );
} 