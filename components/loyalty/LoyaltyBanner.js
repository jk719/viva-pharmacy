"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from 'react';
import { 
  FaCoins,
  FaGift,
  FaSpinner,
  FaArrowUp,
  FaCrown,
  FaGem
} from 'react-icons/fa';
import { 
  IoMdRibbon,
  IoMdStar,
  IoMdTrophy,
  IoIosFlash,
  IoIosRocket
} from 'react-icons/io';
import { Events, eventEmitter } from '@/lib/eventEmitter';
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig';
import { calculateProgressToNextTier } from '@/lib/loyalty/loyaltyCalculator';
import { motion, AnimatePresence } from 'framer-motion';
import HeaderHeightAdjuster from '@/components/HeaderHeightAdjuster';
import Link from 'next/link';

// Tier Colors Configuration
const TIER_COLORS = {
  BRONZE: { icon: 'text-amber-600', bg: 'from-amber-100 to-amber-300' },
  SILVER: { icon: 'text-slate-500', bg: 'from-slate-100 to-slate-300' },
  GOLD: { icon: 'text-yellow-500', bg: 'from-yellow-100 to-yellow-300' },
  PLATINUM: { icon: 'text-cyan-600', bg: 'from-cyan-100 to-cyan-300' },
  SAPPHIRE: { icon: 'text-blue-600', bg: 'from-blue-100 to-blue-300' },
  DIAMOND: { icon: 'text-indigo-600', bg: 'from-indigo-100 to-indigo-300' },
  LEGEND: { icon: 'text-violet-600', bg: 'from-violet-100 to-violet-300' }
};

// Component for Tier Icon with Background
const TierIcon = ({ tier, iconClass, children }) => (
  <div className="relative flex items-center justify-center">
    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${TIER_COLORS[tier]?.bg || TIER_COLORS.BRONZE.bg} opacity-60`}></div>
    {children || <div className={`${iconClass} w-7 h-7 relative z-10`} />}
  </div>
);

// Tier Icons Configuration
const TIER_ICONS = {
  BRONZE: <TierIcon tier="BRONZE"><IoMdRibbon className={`${TIER_COLORS.BRONZE.icon} w-7 h-7 relative z-10`} /></TierIcon>,
  SILVER: <TierIcon tier="SILVER"><IoMdStar className={`${TIER_COLORS.SILVER.icon} w-7 h-7 relative z-10`} /></TierIcon>,
  GOLD: <TierIcon tier="GOLD"><IoMdTrophy className={`${TIER_COLORS.GOLD.icon} w-7 h-7 relative z-10`} /></TierIcon>,
  PLATINUM: <TierIcon tier="PLATINUM"><IoIosFlash className={`${TIER_COLORS.PLATINUM.icon} w-7 h-7 relative z-10`} /></TierIcon>,
  SAPPHIRE: <TierIcon tier="SAPPHIRE"><IoIosRocket className={`${TIER_COLORS.SAPPHIRE.icon} w-7 h-7 relative z-10`} /></TierIcon>,
  DIAMOND: <TierIcon tier="DIAMOND"><FaGem className={`${TIER_COLORS.DIAMOND.icon} w-7 h-7 relative z-10`} /></TierIcon>,
  LEGEND: <TierIcon tier="LEGEND"><FaCrown className={`${TIER_COLORS.LEGEND.icon} w-7 h-7 relative z-10`} /></TierIcon>
};

// Hook for loyalty data fetching and state management
const useLoyaltyData = (session) => {
  const [userData, setUserData] = useState(null);
  const [progressInfo, setProgressInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [animatePoints, setAnimatePoints] = useState(false);
  
  const pollingIntervalRef = useRef(null);
  const paymentEventTimeoutRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const previousPointsRef = useRef(null);
  const progressBarRef = useRef(null);

  // Function to fetch user data using fetch directly with no-store
  const fetchUserDataFresh = async () => {
    if (!session?.user?.id) return null;
    
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
      
      // Reset animation after a delay
      if (animatePoints) {
        setTimeout(() => setAnimatePoints(false), 3000);
      }
    }
  };

  // Function to update user data and progress info
  const updateUserData = async () => {
    const data = await fetchUserDataFresh();
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
      updateUserData();
    }
  }, [session]);

  // Set up polling interval
  useEffect(() => {
    if (!session?.user?.id) return;
    
    // Initial load
    updateUserData();
    
    // Set up interval - 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      updateUserData();
    }, 30000);
    
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
    const handlePaymentComplete = () => {
      // Force immediate update
      updateUserData();
      
      // Schedule a follow-up refresh after a delay
      if (paymentEventTimeoutRef.current) {
        clearTimeout(paymentEventTimeoutRef.current);
      }
      
      paymentEventTimeoutRef.current = setTimeout(() => {
        updateUserData();
      }, 3000);
    };

    eventEmitter.on(Events.PAYMENT_COMPLETED, handlePaymentComplete);
    return () => {
      eventEmitter.off(Events.PAYMENT_COMPLETED, handlePaymentComplete);
      if (paymentEventTimeoutRef.current) {
        clearTimeout(paymentEventTimeoutRef.current);
      }
    };
  }, []);

  return {
    userData,
    progressInfo,
    isLoading,
    animatePoints,
    progressBarRef
  };
};

// Subcomponent for the tier and points display
const TierPointsDisplay = ({ currentTier, currentVivaBucks, animatePoints }) => (
  <div className="flex items-center space-x-4 md:space-x-5 flex-1 z-10">
    {/* Tier icon */}
    <div className="flex md:flex items-center justify-center w-14 h-14 rounded-full relative shadow-sm">
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${TIER_COLORS[currentTier]?.bg || TIER_COLORS.BRONZE.bg} opacity-60`}></div>
      <div className="relative z-20 scale-110">
        {TIER_ICONS[currentTier] || TIER_ICONS.BRONZE}
      </div>
    </div>
    
    {/* Tier and points info */}
    <div>
      <motion.div 
        className="flex items-center space-x-2"
        animate={{ 
          color: animatePoints ? '#FF6B00' : '#4B5563'
        }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-sm md:text-base font-bold tracking-wider uppercase">
          {currentTier}
        </h3>
        <span className="text-xs md:text-sm px-2 py-0.5 rounded-full text-white font-semibold"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF9F43)"
              }}>
          {TIER_CONFIG[currentTier]?.multiplier || 1}x
        </span>
      </motion.div>
      
      {/* VivaBucks display with animation */}
      <div className="flex items-baseline space-x-2 mt-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVivaBucks}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center"
          >
            <div className="relative mr-1.5">
              <FaCoins className={`h-5 w-5 ${animatePoints ? 'text-[#FFD700]' : 'text-[#FF6B00]'}`} />
            </div>
            <span className={`text-xl md:text-2xl font-extrabold transition-all duration-500 ${animatePoints ? 'text-[#FF6B00] scale-110' : 'text-gray-800'}`}>
              {currentVivaBucks.toLocaleString()}
            </span>
          </motion.div>
        </AnimatePresence>
        <span className="text-xs text-gray-500">Points</span>
      </div>
    </div>
  </div>
);

// Subcomponent for the progress bar
const ProgressBar = ({ nextTierName, progressPercent, pointsNeeded, progressBarRef }) => (
  <div className="mt-2 md:mt-0 w-full md:w-auto md:flex-1 md:mx-6 max-w-md px-1 md:px-3 z-10">
    {/* Progress label - simplified */}
    <div className="flex justify-between items-center text-xs mb-1.5 text-gray-600">
      <div className="flex items-center space-x-1.5">
        <FaArrowUp className="text-[#FF6B00]" size={10} />
        <span>Next: {nextTierName}</span>
      </div>
    </div>
    
    {/* Progress bar */}
    <div 
      ref={progressBarRef}
      className="w-full bg-gray-100 rounded-full h-5 shadow-inner relative overflow-hidden"
    >
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
        className="h-full rounded-full overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #FF6B00, #FF9F43)"
        }}
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
      </motion.div>
    </div>
    
    {/* Bottom info - simplified */}
    <div className="text-xs mt-1.5 flex justify-between items-center">
      <div className="text-gray-600">
        {pointsNeeded > 0 ? (
          <span className="whitespace-nowrap">{pointsNeeded.toLocaleString()} more points</span>
        ) : (
          <span className="text-[#FF6B00] font-medium">Max tier!</span>
        )}
      </div>
    </div>
  </div>
);

// Subcomponent for the rewards display
const RewardsDisplay = ({ couponCount, totalCouponValue }) => (
  <div className="flex items-center z-10 ml-auto mt-2 md:mt-0">
    <Link href="/profile/rewards" className="no-underline">
      {couponCount > 0 ? (
        <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
          <div className="flex items-center text-blue-800">
            <FaGift className="mr-1.5 text-blue-500" />
            <span className="font-medium text-sm">
              ${totalCouponValue} reward
            </span>
          </div>
          <div className="text-xs text-blue-600 mt-0.5">
            {couponCount} coupon{couponCount > 1 ? 's' : ''} available
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500 flex items-center px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <FaGift className="mr-1.5 text-gray-400" />
          <span>No rewards yet</span>
        </div>
      )}
    </Link>
  </div>
);

// Loading component
const LoadingState = () => (
  <div className="text-center w-full py-2 flex flex-col justify-center items-center z-10">
    <motion.div
      animate={{ 
        rotate: 360
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: "linear" 
      }}
    >
      <FaSpinner className="text-[#FF6B00] mb-2" size={28} />
    </motion.div>
    <span className="text-xs text-gray-500">Loading rewards...</span>
  </div>
);

// Main component
export default function LoyaltyBanner() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  
  // Setup mounted state
  useEffect(() => {
    setMounted(true);
    return () => {};
  }, []);

  // Use our custom hook to manage loyalty data
  const { 
    userData,
    progressInfo,
    isLoading, 
    animatePoints,
    progressBarRef
  } = useLoyaltyData(session);

  if (!mounted || status === "loading" || !session) return null;

  // Extract values with fallbacks
  const currentVivaBucks = userData?.vivaBucks ?? 0;
  const lifetimeVivaBucks = userData?.cumulativePoints ?? 0;
  const currentTier = userData?.currentTier || 'BRONZE';
  
  // Get available coupons
  const availableCoupons = userData?.coupons?.filter(c => !c.isUsed) || [];
  const couponCount = availableCoupons.length;
  const totalCouponValue = availableCoupons.reduce((total, coupon) => total + (coupon.amount || 0), 0);
  
  // Get progress data with fallbacks
  const nextTierName = progressInfo?.nextTier ?? 'SILVER';
  const progressPercent = progressInfo?.progress ?? 0;
  const pointsNeeded = progressInfo?.pointsNeeded ?? 0;

  // Get banner accent color
  const bannerAccentColor = TIER_COLORS[currentTier]?.bg || TIER_COLORS.BRONZE.bg;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="loyalty-banner py-3 px-4 md:px-6 flex flex-wrap justify-between items-center relative overflow-hidden h-auto md:h-[100px] border-b"
        style={{
          background: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderBottom: "1px solid rgba(0,0,0,0.08)"
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform rotate-45 translate-x-12 -translate-y-12 z-0">
          <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 transform -rotate-45 -translate-x-8 translate-y-8 z-0">
          <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
        </div>

        {userData ? (
          <>
            {/* Left section - Tier info and points */}
            <TierPointsDisplay 
              currentTier={currentTier}
              currentVivaBucks={currentVivaBucks}
              animatePoints={animatePoints}
            />

            {/* Middle section - Progress bar */}
            {progressInfo && (
              <ProgressBar 
                nextTierName={nextTierName}
                progressPercent={progressPercent}
                pointsNeeded={pointsNeeded}
                progressBarRef={progressBarRef}
              />
            )}

            {/* Right section - Available rewards */}
            <RewardsDisplay 
              couponCount={couponCount}
              totalCouponValue={totalCouponValue}
            />
          </>
        ) : (
          <LoadingState />
        )}
      </motion.div>
      <HeaderHeightAdjuster />
    </>
  );
} 