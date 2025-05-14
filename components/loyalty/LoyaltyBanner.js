"use client";

import { useSession } from "next-auth/react";
import { FaSpinner, FaChartLine, FaTrophy } from 'react-icons/fa';
import { useState, useEffect, memo } from 'react';
import eventEmitter, { Events } from '@/lib/eventEmitter';

// Import components
import TierProgressBar from './components/TierProgressBar';
import VivaBucksDisplay from './components/VivaBucksDisplay';
import TierPointsDisplay from './components/TierPointsDisplay';

// Import Zustand store
import useLoyaltyStore from '@/lib/loyalty/loyaltyStore';

// Import hooks and constants
import { getProgressBarData } from '@/lib/loyalty/loyaltyCalculator';
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig';
import { EXTENDED_TIER_BASE_VIVABUCKS, EXTENDED_TIER_STEP_VIVABUCKS } from '@/lib/loyalty/loyaltyConstants';

/**
 * Loading state component for loyalty banner
 */
const LoadingState = () => (
  <div className="text-center w-full py-1 flex justify-center items-center">
    <div className="animate-spin mr-2">
      <FaSpinner className="text-[#FF6B00]" size={20} />
    </div>
    <span className="text-xs text-gray-500">Loading rewards...</span>
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
    pendingTransactions
  } = useLoyaltyStore();
  
  const { data: session, status } = useSession();
  const [animationCompleted, setAnimationCompleted] = useState(false);
  // Track last animated value and whether to animate
  const [lastAnimatedVivaBucks, setLastAnimatedPoints] = useState(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [pendingAnimation, setPendingAnimation] = useState(null);

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

  // Only trigger animation when cumulativeVivaBucks actually changes
  useEffect(() => {
    if (!userData) return;
    
    if (lastAnimatedVivaBucks === null) {
      setLastAnimatedPoints(userData.cumulativeVivaBucks || 0);
      return;
    }
    
    if (userData.cumulativeVivaBucks !== lastAnimatedVivaBucks) {
      console.log('[LoyaltyBanner] cumulativeVivaBucks changed, triggering animation', {
        previous: lastAnimatedVivaBucks,
        current: userData.cumulativeVivaBucks
      });
      
      setShouldAnimate(true);
      setLastAnimatedPoints(userData.cumulativeVivaBucks);
      setAnimationCompleted(false);
    }
  }, [userData?.cumulativeVivaBucks, lastAnimatedVivaBucks]);

  // Don't render for unauthenticated users
  if (status === "loading" || !session) return null;
  if (isLoading || !userData) return <LoadingState />;

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
      className="loyalty-banner w-full py-3 px-4 relative overflow-hidden border-b bg-white"
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        minHeight: "75px"
      }}
    >
      {/* Decorative background */}
      <div 
        className="absolute top-0 right-0 w-20 h-20 opacity-10 transform rotate-45 translate-x-10 -translate-y-10 z-0"
        aria-hidden="true"
      >
        <div className="w-full h-full bg-gradient-to-br from-[#FF9F43] to-[#FF6B00]"></div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 z-10">
        {/* Current VivaBucks display */}
        <VivaBucksDisplay 
          currentVivaBucks={currentVivaBucks}
          currentTier={currentTier}
          multiplier={multiplier}
        />
        
        {/* Progress bar */}
        {progressInfo && !hideProgressBar && progressData && (
          <div className="w-full md:w-1/2 lg:w-3/5 flex-grow">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <div className="flex items-center">
                <FaChartLine className="h-3 w-3 text-blue-500 mr-1" />
                <span>Progress to {progressData.nextTierName || 'next tier'}</span>
              </div>
              
              <div className="flex items-center">
                <FaTrophy className="h-3 w-3 text-amber-500 mr-1" />
                <span>{lifetimeVivaBucks.toLocaleString()} Lifetime VivaBucks</span>
              </div>
            </div>
            
            <TierProgressBar 
              progress={progressData.progress}
              earnedPoints={pendingAnimation || animateEarnedVivaBucks}
              currentPoints={lifetimeVivaBucks}
              startPoints={progressData.startVivaBucks}
              endPoints={progressData.endVivaBucks}
              label={progressData.extendedLabel}
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