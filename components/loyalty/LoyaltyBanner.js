"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaCoins,
  FaGift,
  FaSpinner,
  FaArrowUp,
  FaCrown,
  FaGem,
  FaCar
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

// Car icon component for better cross-platform display
const CarIcon = ({ animating }) => (
  <div className={`text-[#FF6B00] ${animating ? 'animate-bounce' : ''}`} style={{ lineHeight: 0 }}>
    <FaCar size={14} />
  </div>
);

// Add this function at the top of your file, right after the imports
// This will be used for the counter animation
const CounterAnimation = ({ value, duration = 2000 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);
  
  useEffect(() => {
    // Skip animation for initial load
    if (prevValueRef.current === 0) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }
    
    // Only animate if value has changed
    if (value !== prevValueRef.current) {
      const startValue = prevValueRef.current;
      const difference = value - startValue;
      const startTime = performance.now();
      
      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function: Cubic ease-out for a more natural feel
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + difference * easeProgress);
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          prevValueRef.current = value;
        }
      };
      
      requestAnimationFrame(step);
    }
  }, [value, duration]);
  
  return displayValue.toLocaleString();
};

// Hook for loyalty data fetching and state management
const useLoyaltyData = (session) => {
  const [userData, setUserData] = useState(null);
  const [progressInfo, setProgressInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [animatePoints, setAnimatePoints] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const pollingIntervalRef = useRef(null);
  const paymentEventTimeoutRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const previousPointsRef = useRef(null);
  const progressBarRef = useRef(null);
  const carElementRef = useRef(null);
  const sseInitializedRef = useRef(false);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Function to fetch user data using fetch directly with no-store
  const fetchUserDataFresh = useCallback(async () => {
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
  }, [session, animatePoints]);

  // Function to update user data and progress info
  const updateUserData = useCallback(async () => {
    const data = await fetchUserDataFresh();
    if (!data) return;
    
    // Update user data
    setUserData(data);
    setIsInitialized(true);
    
    // Calculate progress info
    if (data.cumulativePoints && typeof data.cumulativePoints === 'number') {
      try {
        const progress = calculateProgressToNextTier(data.cumulativePoints, TIER_CONFIG);
        setProgressInfo(progress);
      } catch (err) {
        console.error('Error calculating tier progress:', err);
      }
    }
  }, [fetchUserDataFresh]);

  // Initialize SSE on component load
  useEffect(() => {
    // Only initialize SSE once
    if (sseInitializedRef.current) return;
    
    const initSSE = async () => {
      try {
        if (typeof window !== 'undefined') {
          const { default: sseManager } = await import('@/lib/sseManager');
          
          if (session?.user?.id) {
            // Connect to SSE
            sseManager.connect(session.user.id).catch(console.error);
            sseInitializedRef.current = true;
            
            // Add listener for loyalty events
            const removeListener = sseManager.addListener((event) => {
              if (event.type === 'LOYALTY_UPDATE' || event.type === 'POINTS_EARNED') {
                console.log('🔄 Loyalty update received via SSE, refreshing data');
                updateUserData();
              }
            });
            
            return () => {
              if (removeListener) removeListener();
            };
          }
        }
      } catch (error) {
        console.error('Error initializing SSE:', error);
      }
    };
    
    initSSE();
  }, [session, updateUserData]);

  // Initial data fetch when session is available
  useEffect(() => {
    if (session?.user?.id) {
      updateUserData();
      
      // Force an update after a short delay for mobile devices
      // This ensures the animation works on first render
      if (isMobile) {
        const timer = setTimeout(() => {
          if (progressBarRef.current && carElementRef.current) {
            // Force a reflow/repaint by accessing offsetWidth
            const width = progressBarRef.current.offsetWidth;
            const carPos = carElementRef.current.offsetLeft;
            
            console.log('Mobile initial render, refreshing layout', { width, carPos });
          }
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [session, updateUserData, isMobile]);

  // Modify the mobile-specific useEffect to use a longer interval
  useEffect(() => {
    if (!isMobile || !session?.user?.id) return;
    
    // Define the handler functions
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📱 Mobile: page became visible, refreshing loyalty data');
        updateUserData();
      }
    };
    
    const handleStorageEvent = (e) => {
      if (e && e.key === 'viva_payment_completed') {
        console.log('📱 Mobile: detected payment completion via storage event');
        updateUserData();
      }
    };
    
    const handleCustomEvent = (e) => {
      console.log('📱 Mobile: detected custom payment completion event', e);
      updateUserData();
    };
    
    // Increase mobile polling interval to 30 seconds instead of 5
    const mobilePollingInterval = setInterval(() => {
      updateUserData();
    }, 30000); // Changed from 5000 to 30000
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('viva:payment:completed', handleCustomEvent);
    
    // Create global refresh function with debounce
    const debounceTimeout = useRef(null);
    window.refreshLoyaltyData = () => {
      console.log('📱 Mobile global refresh function called');
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        updateUserData();
      }, 1000);
    };
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('viva:payment:completed', handleCustomEvent);
      clearInterval(mobilePollingInterval);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (window.refreshLoyaltyData) {
        delete window.refreshLoyaltyData;
      }
    };
  }, [isMobile, session, updateUserData]);

  // Modify the main polling interval
  useEffect(() => {
    if (!session?.user?.id) return;
    
    // Set up interval - increase to 60 seconds
    pollingIntervalRef.current = setInterval(() => {
      updateUserData();
    }, 60000); // Changed from 30000 to 60000
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [session, updateUserData]);

  // Add debouncing to updateUserData
  const debouncedUpdate = useCallback(
    (() => {
      let timeout;
      return () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          fetchUserDataFresh();
        }, 1000);
      };
    })(),
    [fetchUserDataFresh]
  );

  return {
    userData,
    progressInfo,
    isLoading,
    animatePoints,
    progressBarRef,
    carElementRef,
    isMobile,
    isInitialized
  };
};

// Update the ProgressBar component to use VivaBucks terminology
const ProgressBar = ({ 
  nextTierName, 
  progressPercent, 
  pointsNeeded, 
  progressBarRef, 
  animatePoints, 
  isMobile,
  currentPoints,
  currentTier
}) => {
  const [showLabels, setShowLabels] = useState(false);
  const totalPointsRef = useRef(0);
  const startingPointsRef = useRef(0);
  
  // Calculate tier thresholds
  useEffect(() => {
    if (pointsNeeded > 0) {
      // Calculate total points needed for next tier
      const totalForNextTier = TIER_CONFIG[nextTierName]?.points || 0;
      totalPointsRef.current = totalForNextTier;
      
      // Calculate starting points for current tier
      startingPointsRef.current = TIER_CONFIG[currentTier]?.points || 0;
    } else {
      // For max tier, use the tier threshold
      startingPointsRef.current = TIER_CONFIG[currentTier]?.points || 0;
      totalPointsRef.current = startingPointsRef.current;
    }
  }, [pointsNeeded, nextTierName, currentTier]);

  // Show labels after a short delay to ensure smooth animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLabels(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate minimum width for the progress fill
  const minProgressWidth = 50; // minimum width in pixels
  const displayProgress = Math.max(progressPercent, (minProgressWidth / progressBarRef?.current?.offsetWidth || 300) * 100);
  
  return (
    <div className={`${isMobile ? 'mt-1 w-full' : 'mt-2 md:mt-0 px-1 md:px-3 md:flex-1 md:mx-6'} max-w-md z-10`}>
      {/* Header with Next tier and points needed info */}
      <div className={`flex justify-between items-center ${isMobile ? 'mb-1 text-[9px]' : 'mb-1.5 text-xs'} text-gray-600`}>
        <div className="flex items-center space-x-1">
          <FaArrowUp className="text-[#FF6B00]" size={isMobile ? 8 : 10} />
          <span className="font-medium">Next: {nextTierName}</span>
        </div>
        
        <div className="text-gray-700 font-medium">
          {pointsNeeded > 0 ? (
            <span className="whitespace-nowrap flex items-center">
              <span>{pointsNeeded.toLocaleString()}</span>
              <span className="mx-1">more to</span>
              <span className="text-[#FF6B00] font-semibold">{nextTierName}</span>
            </span>
          ) : (
            <span className="text-[#FF6B00]">Max tier reached!</span>
          )}
        </div>
      </div>
      
      {/* Progress bar container */}
      <div className="relative">
        {/* Start/End labels above progress bar */}
        {showLabels && (
          <div className={`flex justify-between items-center ${isMobile ? 'mb-0.5 px-1' : 'mb-1 px-1'}`}>
            <span className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-gray-500`}>
              {startingPointsRef.current.toLocaleString()}
            </span>
            <span className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-gray-500`}>
              {typeof totalPointsRef.current === 'number' ? 
                totalPointsRef.current.toLocaleString() : 'MAX'}
            </span>
          </div>
        )}
        
        {/* Progress bar - THICKER on mobile */}
        <div 
          ref={progressBarRef}
          className={`w-full bg-gray-100 rounded-full ${isMobile ? 'h-6' : 'h-5'} shadow-md relative overflow-hidden border border-gray-200`}
          style={isMobile ? { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } : {}}
        >
          {/* Progress fill with gradient - bolder gradient on mobile */}
          <div
            className="h-full rounded-full transition-all duration-700 relative"
            style={{
              width: `${Math.min(Math.max(displayProgress, 0), 100)}%`,
              background: isMobile 
                ? "linear-gradient(90deg, #FF8036, #FF6B00)" 
                : "linear-gradient(90deg, #FF8036, #FF6B00)",
              boxShadow: isMobile ? 'inset 0 0 10px rgba(255,107,0,0.3)' : 'none'
            }}
          >
            {/* Right-aligned VivaBucks display inside orange area - larger on mobile */}
            {showLabels && (
              <div className={`absolute inset-y-0 right-0 flex items-center ${isMobile ? 'mr-2' : 'mr-3'}`}>
                <div className="flex items-center">
                  <span className={`text-white font-bold ${isMobile ? 'text-sm' : 'text-xs'}`}>
                    {currentPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Tick marks - make more visible on mobile */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={`h-full w-full flex justify-between px-6 ${isMobile ? 'opacity-30' : 'opacity-20'}`}>
              {[...Array(isMobile ? 3 : 5)].map((_, i) => (
                <div key={i} className={`h-full ${isMobile ? 'w-0.5' : 'w-px'} bg-black`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Lifetime VivaBucks display - make more apparent on mobile */}
      <div className={`flex justify-end ${isMobile ? 'mt-1 text-[9px] font-medium' : 'mt-1 text-xs'} ${isMobile ? 'text-gray-600' : 'text-gray-500'}`}>
        <span>Lifetime: <span className={`${isMobile ? 'font-bold' : 'font-medium'}`}>{currentPoints.toLocaleString()}</span> VivaBucks</span>
      </div>
    </div>
  );
};

// Update TierPointsDisplay to show VivaBucks instead of Points and double the size with badges
const TierPointsDisplay = ({ currentTier, currentVivaBucks, lifetimeVivaBucks, animatePoints, isMobile }) => (
  <div className="flex items-center space-x-2 md:space-x-4 flex-1 z-10 scale-[2] origin-left transform mr-4 md:mr-8">
    {/* Tier icon with larger size */}
    <div className={`flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-12 h-12'} rounded-full relative shadow-sm`}>
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${TIER_COLORS[currentTier]?.bg || TIER_COLORS.BRONZE.bg} opacity-60`}></div>
      <div className={`relative z-20 ${isMobile ? 'scale-90' : 'scale-110'}`}>
        {TIER_ICONS[currentTier] || TIER_ICONS.BRONZE}
      </div>
    </div>
    
    {/* Tier and VivaBucks info */}
    <div>
      <motion.div 
        className="flex items-center space-x-1 md:space-x-2"
        animate={{ color: animatePoints ? '#FF6B00' : '#4B5563' }}
        transition={{ duration: 0.5 }}
      >
        <h3 className={`${isMobile ? 'text-xs' : 'text-sm md:text-base'} font-bold tracking-wider uppercase`}>
          {currentTier}
        </h3>
        <span className={`${isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-xs md:text-sm px-2 py-0.5'} rounded-full text-white font-semibold`}
              style={{ background: "linear-gradient(135deg, #FF6B00, #FF9F43)" }}>
          {TIER_CONFIG[currentTier]?.multiplier || 1}x
        </span>
      </motion.div>
      
      {/* VivaBucks display with counter animation */}
      <div className="flex items-baseline space-x-1 md:space-x-2 mt-0.5 md:mt-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`counter-${currentVivaBucks}`}
            initial={{ opacity: 0.7, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center"
          >
            <div className="relative mr-1 md:mr-1.5">
              <FaCoins className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${animatePoints ? 'text-[#FFD700]' : 'text-[#FF6B00]'}`} />
            </div>
            <span className={`${isMobile ? 'text-sm' : 'text-base md:text-xl'} font-extrabold transition-all duration-500 ${animatePoints ? 'text-[#FF6B00] scale-110' : 'text-gray-800'}`}>
              <CounterAnimation value={currentVivaBucks} duration={1500} />
            </span>
          </motion.div>
        </AnimatePresence>
        <span className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-gray-500`}>VivaBucks</span>
      </div>

      {/* Achievement Badges Row */}
      <div className="flex space-x-1 md:space-x-2 mt-1 md:mt-2">
        {/* First Purchase Badge */}
        <div className={`${isMobile ? 'text-[6px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'} rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white font-medium flex items-center`}>
          <FaGift className={`${isMobile ? 'h-1.5 w-1.5' : 'h-2 w-2'} mr-0.5`} />
          <span>First Purchase</span>
        </div>
        
        {/* Loyal Customer Badge */}
        <div className={`${isMobile ? 'text-[6px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'} rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white font-medium flex items-center`}>
          <IoMdStar className={`${isMobile ? 'h-1.5 w-1.5' : 'h-2 w-2'} mr-0.5`} />
          <span>Loyal Customer</span>
        </div>
        
        {/* Referral Badge */}
        <div className={`${isMobile ? 'text-[6px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'} rounded-full bg-gradient-to-r from-purple-400 to-purple-500 text-white font-medium flex items-center`}>
          <FaArrowUp className={`${isMobile ? 'h-1.5 w-1.5' : 'h-2 w-2'} mr-0.5`} />
          <span>Referral Pro</span>
        </div>
      </div>
    </div>
  </div>
);

// Update LoadingState to use VivaBucks
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
    <span className="text-xs text-gray-500">Loading VivaBucks rewards...</span>
  </div>
);

// Main component with reduced size for mobile
export default function LoyaltyBanner() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  
  // Setup mounted state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Use our custom hook to manage loyalty data
  const { 
    userData,
    progressInfo,
    isLoading, 
    animatePoints,
    progressBarRef,
    carElementRef,
    isMobile,
    isInitialized
  } = useLoyaltyData(session);

  if (!mounted || status === "loading" || !session) return null;

  // Extract values with fallbacks
  const currentVivaBucks = userData?.vivaBucks ?? 0;
  const lifetimeVivaBucks = userData?.cumulativePoints ?? 0;
  const currentTier = userData?.currentTier || 'BRONZE';
  
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
        className="loyalty-banner w-full py-1 md:py-2 px-2 md:px-6 relative overflow-hidden border-b"
        style={{
          background: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          minHeight: isMobile ? '70px' : '90px', // Reduced to ~75% on mobile
          height: 'auto'
        }}
      >
        {/* Decorative background elements */}
        <div className={`absolute top-0 right-0 ${isMobile ? 'w-20 h-20' : 'w-32 h-32'} opacity-10 transform rotate-45 translate-x-12 -translate-y-12 z-0`}>
          <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
        </div>
        <div className={`absolute bottom-0 left-0 ${isMobile ? 'w-12 h-12' : 'w-24 h-24'} opacity-10 transform -rotate-45 -translate-x-8 translate-y-8 z-0`}>
          <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
        </div>

        {userData ? (
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row flex-wrap'} justify-between z-10 ${isMobile ? 'items-start' : 'items-center'}`}>
            {/* Tier info section with smaller icon on mobile */}
            <div className={`${isMobile ? 'w-full pb-1.5' : 'w-auto pr-4'}`}>
              {/* Display tier and VivaBucks info */}
              <div className="flex items-center">
                {/* Tier icon - SMALLER on mobile */}
                <div className={`flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-14 h-14'} rounded-full relative shadow-sm ${isMobile ? 'mr-2' : 'mr-3'}`}>
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${TIER_COLORS[currentTier]?.bg || TIER_COLORS.BRONZE.bg} opacity-60`}></div>
                  <div className={`relative z-20 ${isMobile ? 'scale-75' : 'scale-110'}`}>
                    {TIER_ICONS[currentTier] || TIER_ICONS.BRONZE}
                  </div>
                </div>
                
                {/* Tier and VivaBucks info - Compact on mobile */}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`${isMobile ? 'text-xs' : 'text-base'} font-bold tracking-wider uppercase text-gray-700`}>
                      {currentTier}
                    </h3>
                    <span className={`${isMobile ? 'text-[9px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} rounded-full text-white font-semibold`}
                          style={{ background: "linear-gradient(135deg, #FF6B00, #FF9F43)" }}>
                      {TIER_CONFIG[currentTier]?.multiplier || 1}x
                    </span>
                  </div>
                  
                  {/* VivaBucks display - Smaller on mobile */}
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <div className="flex items-center">
                      <div className="relative mr-1">
                        <FaCoins className={`${isMobile ? 'h-3 w-3' : 'h-5 w-5'} text-[#FF6B00]`} />
                      </div>
                      <span className={`${isMobile ? 'text-base' : 'text-xl'} font-extrabold text-gray-800`}>
                        <CounterAnimation value={currentVivaBucks} duration={1500} />
                      </span>
                    </div>
                    <span className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-gray-500`}>VivaBucks</span>
                  </div>
                </div>
              </div>
              
              {/* Horizontal Achievement Badges Row - More compact on mobile */}
              <div className={`badges-container ${isMobile ? 'mt-1 ml-10' : 'mt-2 ml-15'}`}>
                {/* Badge with Vector SVG: First Purchase */}
                <div className="badge-container">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="badge-svg">
                    <defs>
                      <linearGradient id="badge1-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="11" fill="url(#badge1-gradient)" />
                    <path d="M12,6 L9,12 L5,12 L8,16 L7,20 L12,17 L17,20 L16,16 L19,12 L15,12 Z" 
                         fill="white" stroke="white" strokeWidth="0.5" />
                  </svg>
                  <div className="badge-text">First Buy</div>
                </div>
                
                {/* Badge with Vector SVG: Loyal Customer */}
                <div className="badge-container">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="badge-svg">
                    <defs>
                      <linearGradient id="badge2-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="11" fill="url(#badge2-gradient)" />
                    <path d="M12,4 L14,10 L20,10 L15,14 L17,20 L12,16 L7,20 L9,14 L4,10 L10,10 Z" 
                         fill="white" stroke="white" strokeWidth="0.5" />
                  </svg>
                  <div className="badge-text">Loyal</div>
                </div>
                
                {/* Badge with Vector SVG: Referral Pro */}
                <div className="badge-container">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="badge-svg">
                    <defs>
                      <linearGradient id="badge3-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="11" fill="url(#badge3-gradient)" />
                    <path d="M12,4 L12,16 M7,9 L12,4 L17,9" 
                         fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="badge-text">Referrer</div>
                </div>
              </div>
            </div>

            {/* Progress bar section - Reduced height on mobile */}
            {progressInfo && (
              <div className={`${isMobile ? 'w-full' : 'flex-1 max-w-md'}`}>
                {/* Compact progress bar header on mobile */}
                <div className={`flex justify-between items-center ${isMobile ? 'text-[8px] mb-0.5' : 'text-xs mb-1.5'} text-gray-600`}>
                  <div className="flex items-center space-x-1">
                    <FaArrowUp className="text-[#FF6B00]" size={isMobile ? 8 : 12} />
                    <span className="font-medium">Next: {nextTierName}</span>
                  </div>
                  
                  <div className="text-gray-700 font-medium">
                    {pointsNeeded > 0 ? (
                      <span className="whitespace-nowrap flex items-center">
                        <span>{pointsNeeded.toLocaleString()}</span>
                        <span className="mx-1">more to</span>
                        <span className="text-[#FF6B00] font-semibold">{nextTierName}</span>
                      </span>
                    ) : (
                      <span className="text-[#FF6B00]">Max tier reached!</span>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  {/* Smaller labels on mobile */}
                  <div className={`flex justify-between items-center ${isMobile ? 'mb-0.5 px-1' : 'mb-1 px-1'}`}>
                    <span className={`${isMobile ? 'text-[7px]' : 'text-xs'} text-gray-500`}>
                      {TIER_CONFIG[currentTier]?.points.toLocaleString()}
                    </span>
                    <span className={`${isMobile ? 'text-[7px]' : 'text-xs'} text-gray-500`}>
                      {TIER_CONFIG[nextTierName]?.points.toLocaleString() || 'MAX'}
                    </span>
                  </div>
                  
                  {/* Shorter progress bar on mobile */}
                  <div 
                    ref={progressBarRef}
                    className={`w-full bg-gray-100 rounded-full ${isMobile ? 'h-4' : 'h-5'} shadow-md relative overflow-hidden border border-gray-200`}
                    style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700 relative"
                      style={{
                        width: `${Math.min(Math.max(progressPercent, 0), 100)}%`,
                        background: "linear-gradient(90deg, #FF8036, #FF6B00)",
                        boxShadow: 'inset 0 0 10px rgba(255,107,0,0.3)'
                      }}
                    >
                      <div className={`absolute inset-y-0 right-0 flex items-center ${isMobile ? 'mr-1.5' : 'mr-2'}`}>
                        <div className="flex items-center">
                          <span className={`text-white font-bold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {lifetimeVivaBucks.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="h-full w-full flex justify-between px-6 opacity-30">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-full w-0.5 bg-black"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* More compact lifetime display on mobile */}
                <div className={`flex justify-end ${isMobile ? 'mt-0.5 text-[8px]' : 'mt-1 text-xs'} font-medium text-gray-600`}>
                  <span>Lifetime: <span className="font-bold">{lifetimeVivaBucks.toLocaleString()}</span> VivaBucks</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <LoadingState />
        )}
      </motion.div>
      <HeaderHeightAdjuster />
      
      {/* Add the CSS for badges */}
      <style jsx>{`
        .badges-container {
          display: flex;
          flex-direction: row;
          gap: 8px;
        }
        
        .badge-container {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          padding: 2px 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          font-size: 9px;
          font-weight: 500;
          color: #4B5563;
          white-space: nowrap;
        }
        
        .badge-svg {
          margin-right: 4px;
          filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
        }
        
        .badge-text {
          line-height: 1;
        }
        
        @media (max-width: 768px) {
          .badges-container {
            gap: 4px;
          }
          
          .badge-container {
            padding: 1px 3px;
            font-size: 7px;
          }
          
          .badge-svg {
            width: 12px;
            height: 12px;
            margin-right: 2px;
          }
        }
      `}</style>
    </>
  );
} 