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

  // Set up polling interval
  useEffect(() => {
    if (!session?.user?.id) return;
    
    // Set up interval - 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      updateUserData();
    }, 30000);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [session, updateUserData]);

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
  }, [updateUserData]);

  // Replace the existing mobile-specific useEffect with this enhanced version:
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
        // Force an immediate update with a small delay to ensure data is ready
        setTimeout(() => {
          updateUserData();
          
          // Force a second update after a delay to handle potential server latency
          setTimeout(() => {
            updateUserData();
          }, 2000);
        }, 200);
      }
    };
    
    const handleCustomEvent = (e) => {
      console.log('📱 Mobile: detected custom payment completion event', e);
      // Force an immediate update with a small delay to ensure data is ready
      setTimeout(() => {
        updateUserData();
        
        // Force a second update after a delay to handle potential server latency
        setTimeout(() => {
          updateUserData();
        }, 2000);
      }, 200);
    };
    
    // Set up periodic polling specifically for mobile
    const mobilePollingInterval = setInterval(() => {
      updateUserData();
    }, 5000); // Poll every 5 seconds on mobile
    
    // Add event listeners
    try {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('storage', handleStorageEvent);
      window.addEventListener('viva:payment:completed', handleCustomEvent);
      
      // Create global refresh function with enhanced logic for mobile
      window.refreshLoyaltyData = () => {
        console.log('📱 Mobile global refresh function called');
        // Immediate update
        updateUserData();
        
        // Followed by delayed updates to catch server changes
        setTimeout(() => updateUserData(), 1000);
        setTimeout(() => updateUserData(), 3000);
      };
      
      // Force a data refresh when the component mounts on mobile
      updateUserData();
    } catch (error) {
      console.error('Error setting up mobile event listeners:', error);
    }
    
    // Return cleanup function
    return () => {
      try {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('storage', handleStorageEvent);
        window.removeEventListener('viva:payment:completed', handleCustomEvent);
        
        clearInterval(mobilePollingInterval);
        
        if (window.refreshLoyaltyData && window.refreshLoyaltyData.toString().includes('Mobile global refresh')) {
          delete window.refreshLoyaltyData;
        }
      } catch (error) {
        console.error('Error cleaning up mobile event listeners:', error);
      }
    };
  }, [isMobile, session, updateUserData]);

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

// Replace the TierPointsDisplay component with this updated version
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
      
      {/* VivaBucks display with counter animation */}
      <div className="flex items-baseline space-x-2 mt-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`counter-${currentVivaBucks}`}
            initial={{ opacity: 0.7, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center"
          >
            <div className="relative mr-1.5">
              <FaCoins className={`h-5 w-5 ${animatePoints ? 'text-[#FFD700]' : 'text-[#FF6B00]'}`} />
            </div>
            <span className={`text-xl md:text-2xl font-extrabold transition-all duration-500 ${animatePoints ? 'text-[#FF6B00] scale-110' : 'text-gray-800'}`}>
              <CounterAnimation value={currentVivaBucks} duration={1500} />
            </span>
          </motion.div>
        </AnimatePresence>
        <span className="text-xs text-gray-500">Points</span>
      </div>
    </div>
  </div>
);

// Updated ProgressBar component to indicate what points are towards

const ProgressBar = ({ nextTierName, progressPercent, pointsNeeded, progressBarRef, animatePoints }) => {
  const currentPoints = useRef(0);
  const totalPointsRef = useRef(0);
  const [showLabels, setShowLabels] = useState(false);
  
  // Calculate current points and total points needed for next tier
  useEffect(() => {
    if (pointsNeeded > 0) {
      // If this isn't top tier, calculate points earned so far
      const totalPointsForNextTier = Math.round(pointsNeeded / (1 - progressPercent / 100));
      currentPoints.current = Math.round(totalPointsForNextTier - pointsNeeded);
      totalPointsRef.current = totalPointsForNextTier;
    } else {
      // For max tier, just show they have enough points
      currentPoints.current = "MAX";
      totalPointsRef.current = currentPoints.current;
    }
  }, [progressPercent, pointsNeeded]);

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
    <div className="mt-2 md:mt-0 w-full md:w-auto md:flex-1 md:mx-6 max-w-md px-1 md:px-3 z-10">
      {/* Header with Next tier label */}
      <div className="flex justify-between items-center text-xs mb-1.5 text-gray-600">
        <div className="flex items-center space-x-1.5">
          <FaArrowUp className="text-[#FF6B00]" size={10} />
          <span className="font-medium">Next: {nextTierName}</span>
        </div>
        
        {/* Clearly indicate what points are towards */}
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
      
      {/* Modern progress bar container */}
      <div className="relative">
        {/* Start/End labels above progress bar */}
        {showLabels && (
          <div className="flex justify-between items-center mb-1 px-1 text-xs">
            <span className="text-gray-500">0</span>
            <span className="text-gray-500">
              {typeof totalPointsRef.current === 'number' ? 
                totalPointsRef.current.toLocaleString() : 'MAX'}
            </span>
          </div>
        )}
        
        {/* Progress bar */}
        <div 
          ref={progressBarRef}
          className="w-full bg-gray-100 rounded-full h-7 shadow-inner relative overflow-hidden border border-gray-200"
        >
          {/* Progress fill with gradient */}
          <div
            className="h-full rounded-full transition-all duration-700 relative"
            style={{
              width: `${Math.min(Math.max(displayProgress, 0), 100)}%`,
              background: "linear-gradient(90deg, #FF8036, #FF6B00)",
            }}
          >
            {/* Right-aligned point display inside orange area */}
            {showLabels && (
              <div className="absolute inset-y-0 right-0 flex items-center mr-3">
                <div className="flex items-center">
                  <span className="text-white font-bold text-sm">
                    {typeof currentPoints.current === 'number' ? 
                      <CounterAnimation value={currentPoints.current} duration={1500} /> :
                      currentPoints.current
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Add subtle tick marks for a modern design */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-full w-full flex justify-between px-6 opacity-20">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-full w-px bg-black"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    
    // This helps with mobile initialization
    return () => {
      setMounted(false);
    };
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
        className={`loyalty-banner py-3 px-4 md:px-6 flex flex-wrap justify-between items-center relative overflow-hidden ${isMobile ? 'h-auto pb-5' : 'md:h-[100px]'} border-b`}
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
                animatePoints={animatePoints}
              />
            )}
          </>
        ) : (
          <LoadingState />
        )}
      </motion.div>
      <HeaderHeightAdjuster />
    </>
  );
} 