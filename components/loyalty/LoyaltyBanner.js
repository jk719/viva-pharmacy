"use client";

import { useSession } from "next-auth/react";
import { FaSpinner, FaChartLine, FaTrophy } from 'react-icons/fa';
import { useState, useEffect, memo } from 'react';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { useImprovedLoyaltyStore } from '@/lib/loyalty/improvedLoyaltyStore';
import { TIMING } from '@/constants/timing';

// Import components
import LoyaltyProgressBar from './LoyaltyProgressBar';
import ImprovedVivaBucksDisplay from './components/ImprovedVivaBucksDisplay';
import TierPointsDisplay from './components/TierPointsDisplay';
import { FaSync } from 'react-icons/fa';

// Import hooks and constants
import { getProgressBarData } from '@/lib/loyalty/loyaltyCalculator';
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig';

/**
 * Loading state component for loyalty banner
 */
const LoadingState = () => (
  <div className="w-full py-2 px-4 bg-white border-b" style={{ minHeight: "var(--loyalty-banner-height)" }}>
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse flex items-center space-x-2">
        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
        <div className="w-24 h-3 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

/**
 * Main loyalty banner component that displays user's tier and progress
 * @param {Object} props Component properties
 * @param {boolean} [props.forceAnimation=false] - Force animation even if not triggered by an event
 * @param {number} [props.animateEarnedVivaBucks] - Points to animate as newly earned
 * @param {Function} [props.onProgressBarAnimationComplete] - Callback when progress bar animation completes
 * @param {boolean} [props.hideProgressBar=false] - Whether to hide the progress bar
 */
function LoyaltyBanner({ 
  animateEarnedVivaBucks, 
  onProgressBarAnimationComplete,
  hideProgressBar = false,
  forceAnimation = false
}) {
  // Get loyalty data from Zustand store
  const { 
    userData, 
    progressInfo, 
    isLoading, 
    fetchUserData,
    pendingTransactions,
    forceRefresh
  } = useImprovedLoyaltyStore();
  
  const { data: session, status } = useSession();
  const [animationCompleted, setAnimationCompleted] = useState(false);
  // Track last animated value and whether to animate
  const [lastAnimatedVivaBucks, setLastAnimatedPoints] = useState(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [pendingAnimation, setPendingAnimation] = useState(null);
  const [animationDebounce, setAnimationDebounce] = useState(null);

  // Initial data fetch when component mounts 
  useEffect(() => {
    if (session?.user?.id && !userData) {
      fetchUserData();
    }
  }, [session, userData, fetchUserData]);

  // Watch for pending transactions to trigger animations
  useEffect(() => {
    // Find the most recent pending transaction
    const latestPending = [...pendingTransactions]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .find(tx => tx.status === 'pending');
    
    if (latestPending && latestPending.type === 'EARN') {
      // Set pending animation with the transaction amount
      setPendingAnimation(latestPending.amount);
      setShouldAnimate(true);
      setAnimationCompleted(false);
    }
  }, [pendingTransactions]);

  // Handle payment completed events
  useEffect(() => {
    const handlePaymentCompleted = (data) => {
      console.log('[LoyaltyBanner] Payment completed event received:', { 
        userId: data.userId,
        vivaBucksEarned: data.vivaBucksEarned
      });
      
      // Force animation when payment is completed
      if (data.vivaBucksEarned && data.vivaBucksEarned > 0) {
        setPendingAnimation(data.vivaBucksEarned);
        setShouldAnimate(true);
        setAnimationCompleted(false);
      }
    };
    
    eventEmitter.on(Events.PAYMENT_COMPLETED, handlePaymentCompleted);
    return () => {
      eventEmitter.off(Events.PAYMENT_COMPLETED, handlePaymentCompleted);
    };
  }, []);

  // Handle animation completion
  const handleAnimationComplete = () => {
    console.log('[LoyaltyBanner] ProgressBar animation complete!');
    setShouldAnimate(false);
    setAnimationCompleted(true);
    setPendingAnimation(null);
    
    if (typeof onProgressBarAnimationComplete === 'function') {
      console.log('[LoyaltyBanner] Calling parent onProgressBarAnimationComplete callback...');
      try {
        onProgressBarAnimationComplete();
        console.log('[LoyaltyBanner] Parent callback executed successfully.');
      } catch (error) {
        console.error('[LoyaltyBanner] Animation completion callback error:', error);
      }
    } else {
      console.log('[LoyaltyBanner] No parent onProgressBarAnimationComplete callback provided.');
    }
  };

  // Only trigger animation when cumulativeVivaBucks actually changes (with debouncing)
  useEffect(() => {
    if (!userData) return;
    
    if (lastAnimatedVivaBucks === null) {
      setLastAnimatedPoints(userData.cumulativeVivaBucks || 0);
      return;
    }
    
    if (userData.cumulativeVivaBucks !== lastAnimatedVivaBucks) {
      // Clear existing debounce
      if (animationDebounce) {
        clearTimeout(animationDebounce);
      }
      
      // Debounce animation trigger to prevent conflicts
      const newDebounce = setTimeout(() => {
        console.log('[LoyaltyBanner] cumulativeVivaBucks changed, triggering animation', {
          previous: lastAnimatedVivaBucks,
          current: userData.cumulativeVivaBucks
        });
        
        setShouldAnimate(true);
        setLastAnimatedPoints(userData.cumulativeVivaBucks);
        setAnimationCompleted(false);
      }, TIMING.LOYALTY.DEBOUNCE);
      
      setAnimationDebounce(newDebounce);
    }
  }, [userData?.cumulativeVivaBucks, lastAnimatedVivaBucks, animationDebounce]);

  // Cleanup animation debounce on unmount
  useEffect(() => {
    return () => {
      if (animationDebounce) {
        clearTimeout(animationDebounce);
      }
    };
  }, [animationDebounce]);

  // Don't render for unauthenticated users
  if (status === "loading") return null;
  if (!session) return null;
  
  // Show loading state only if we're loading AND don't have any cached data
  if (isLoading && !userData) return <LoadingState />;
  
  // If we don't have userData but we're not loading, try to fetch it
  if (!userData && !isLoading) {
    fetchUserData();
    return <LoadingState />;
  }

  // Extract user data
  const currentVivaBucks = userData?.vivaBucks || 0;
  const lifetimeVivaBucks = userData?.cumulativeVivaBucks || 0;
  const currentTier = userData?.currentTier || 'BRONZE'; 
  const multiplier = userData?.vivaBucksMultiplier || 1;

  // Progress bar data - use centralized function
  const progressData = progressInfo ? 
    getProgressBarData(lifetimeVivaBucks, currentVivaBucks, currentTier, multiplier, !!animateEarnedVivaBucks) : null;

  return (
    <div 
      className="loyalty-banner w-full py-0.5 md:py-2 px-3 md:px-4 relative border-b bg-white"
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        minHeight: "var(--loyalty-banner-height)",
        maxHeight: "calc(var(--loyalty-banner-height) * 2.5)", // Limit maximum expansion
        zIndex: "var(--z-loyalty-banner)",
        overflow: "hidden",
        contain: "layout style",
        isolation: "isolate",
        transition: "max-height 0.3s ease-in-out" // Smooth height transitions
      }}
    >
      {/* Decorative background */}
      <div 
        className="absolute top-0 right-0 w-16 md:w-20 h-16 md:h-20 opacity-10 transform rotate-45 translate-x-10 -translate-y-10 pointer-events-none"
        style={{ zIndex: "var(--z-loyalty-decorative)" }}
        aria-hidden="true"
      >
        <div className="w-full h-full bg-gradient-to-br from-[#FF9F43] to-[#FF6B00]"></div>
      </div>

      <div 
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-3" 
        style={{ zIndex: "var(--z-loyalty-content)", position: 'relative' }}
      >
        {/* Current VivaBucks display */}
        <ImprovedVivaBucksDisplay 
          currentVivaBucks={currentVivaBucks}
          lifetimeVivaBucks={lifetimeVivaBucks}
          currentTier={currentTier}
          multiplier={multiplier}
        />
        
        {/* Progress bar */}
        {progressInfo && !hideProgressBar && progressData && (
          <div className="w-full md:w-1/2 lg:w-3/5 flex-grow">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-0.5 md:mb-1">
              <div className="flex items-center">
                <FaChartLine className="h-2.5 md:h-3 w-2.5 md:w-3 text-blue-500 mr-1" />
                <span className="text-xs md:text-sm">Progress to {progressData.nextTierName || 'next tier'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-500">
                  {progressData.endVivaBucks - lifetimeVivaBucks} more needed
                </span>
                <button
                  onClick={() => {
                    console.log('🔄 Force refreshing loyalty data...');
                    forceRefresh();
                  }}
                  className="text-gray-400 hover:text-amber-500 transition-colors"
                  title="Refresh loyalty data"
                >
                  <FaSync className="h-2.5 md:h-3 w-2.5 md:w-3" />
                </button>
              </div>
            </div>
            
            <LoyaltyProgressBar 
              currentPoints={lifetimeVivaBucks}
              earnedPoints={pendingAnimation || animateEarnedVivaBucks}
              startPoints={progressData.startVivaBucks}
              endPoints={progressData.endVivaBucks}
              label={progressData.extendedLabel || 'Progress to next tier'}
              animate={shouldAnimate}
              forceAnimation={forceAnimation}
              onAnimationComplete={handleAnimationComplete}
              variant="compact"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Export memoized component
export default memo(LoyaltyBanner);