"use client";

import { useSession } from "next-auth/react";
import { FaSpinner } from 'react-icons/fa';
import { useState, useEffect, memo } from 'react';
import eventEmitter, { Events } from '@/lib/eventEmitter';

// Import components
import ProgressBar from './components/ProgressBar';
import TierPointsDisplay from './components/TierPointsDisplay';

// Import hooks and constants
import useLoyaltyData from './hooks/useLoyaltyData';
import { TIER_COLORS } from './constants/tierConfig';
import { 
  getCurrentPoints,
  getLifetimePoints,
  getCurrentTier,
  getPointsMultiplier
} from '@/lib/loyalty/userDataAccess';

/**
 * Loading state component for loyalty banner
 */
const LoadingState = () => (
  <div 
    className="text-center w-full py-2 flex flex-col justify-center items-center z-10"
    data-testid="loyalty-banner-loading"
  >
    <div className="animate-spin mb-2">
      <FaSpinner className="text-[#FF6B00]" size={28} />
    </div>
    <span className="text-xs text-gray-500">Loading VivaBucks rewards...</span>
  </div>
);

/**
 * Main loyalty banner component that displays user's tier and progress
 * @param {Object} props Component properties
 * @param {boolean} props.forceAnimation - Force animation even if not triggered by an event
 * @param {Function} props.onProgressBarAnimationComplete - Callback when progress bar animation completes
 */
function LoyaltyBanner({ forceAnimation = false, onProgressBarAnimationComplete }) {
  const { data: session, status } = useSession();

  // Use the custom hook to get loyalty data
  const { 
    userData,
    progressInfo,
    isLoading, 
    isMobile
  } = useLoyaltyData();
  
  // Track animation state for deduplication
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  
  // Effect to log component mount/unmount for debugging
  useEffect(() => {
    console.log('🏁 LoyaltyBanner mounted with forceAnimation =', forceAnimation);
    return () => console.log('🚫 LoyaltyBanner unmounted');
  }, [forceAnimation]);
  
  // Handle animation completion - simplified to avoid duplicate events
  const handleAnimationComplete = () => {
    console.log('🔔 Loyalty banner progress bar animation completed');
    
    // Prevent duplicate completions
    if (animationCompleted) {
      console.log('⚠️ Animation already completed, ignoring duplicate completion');
      return;
    }
    
    // Mark animation as completed
    setAnimationCompleted(true);
    setAnimationInProgress(false);
    
    // Call the callback directly - ProgressBar no longer handles event emission
    if (typeof onProgressBarAnimationComplete === 'function') {
      console.log('📣 Calling onProgressBarAnimationComplete callback');
      try {
        onProgressBarAnimationComplete();
      } catch (error) {
        console.error('Error in animation completion callback:', error);
      }
    }
  };

  // Don't render anything if user is not logged in
  if (status === "loading" || !session) return null;

  // Extract values using the data access layer
  const currentVivaBucks = getCurrentPoints(userData);
  const lifetimeVivaBucks = getLifetimePoints(userData);
  const currentTier = getCurrentTier(userData);
  const multiplier = getPointsMultiplier(userData);
  
  // Extract progress info with fallbacks
  const nextTierName = progressInfo?.nextTier ?? 'SILVER';
  const progressPercent = progressInfo?.progress ?? 0;
  const startPoints = progressInfo?.startPoints ?? 0;
  const endPoints = progressInfo?.endPoints ?? 0;
  
  // Get background accent color based on tier
  const bannerAccentColor = TIER_COLORS[currentTier]?.bg || TIER_COLORS.BRONZE.bg;

  // Use a stable key to prevent unmounting/remounting
  const stableKey = `loyalty-banner-${currentTier || 'unknown'}`;
  
  return (
    <div 
      key={stableKey}
      className="loyalty-banner w-full py-1 md:py-2 px-2 md:px-6 relative overflow-hidden border-b"
      style={{
        background: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        minHeight: isMobile ? '70px' : '90px',
        height: 'auto'
      }}
      data-testid="loyalty-banner"
    >
      {/* Decorative background elements */}
      <div 
        className={`absolute top-0 right-0 ${isMobile ? 'w-20 h-20' : 'w-32 h-32'} opacity-10 transform rotate-45 translate-x-12 -translate-y-12 z-0`}
        aria-hidden="true"
      >
        <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
      </div>
      <div 
        className={`absolute bottom-0 left-0 ${isMobile ? 'w-12 h-12' : 'w-24 h-24'} opacity-10 transform -rotate-45 -translate-x-8 translate-y-8 z-0`}
        aria-hidden="true"
      >
        <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
      </div>

      {userData ? (
        <div 
          className={`flex ${isMobile ? 'flex-col' : 'flex-row flex-wrap'} justify-between z-10 ${isMobile ? 'items-start' : 'items-center'}`}
          data-testid="loyalty-banner-content"
        >
          {/* Points and tier display */}
          <TierPointsDisplay 
            currentTier={currentTier}
            points={currentVivaBucks}
            multiplier={multiplier}
            isMobile={isMobile}
          />
          
          {/* Progress bar with animation */}
          {progressInfo && (
            <ProgressBar 
              progress={progressPercent}
              currentPoints={lifetimeVivaBucks}
              startPoints={startPoints}
              endPoints={endPoints}
              animate={true}
              forceAnimation={forceAnimation}
              onAnimationComplete={handleAnimationComplete}
              key={`progress-bar-${forceAnimation ? 'forced' : 'normal'}`} /* Use a stable key to prevent unmounting/remounting */
              data-testid="animated-progress-bar"
            />
          )}
        </div>
      ) : (
        <LoadingState />
      )}
    </div>
  );
}

// Export a memoized version of the component to prevent unnecessary re-renders
export default memo(LoyaltyBanner, (prevProps, nextProps) => {
  // Only re-render if forceAnimation changes or if the callback changes
  return (
    prevProps.forceAnimation === nextProps.forceAnimation &&
    prevProps.onProgressBarAnimationComplete === nextProps.onProgressBarAnimationComplete
  );
});