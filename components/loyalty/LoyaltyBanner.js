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
import { calculateProgressToNextTier } from '@/lib/loyalty/loyaltyCalculator';
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig';

/**
 * Loading state component for loyalty banner
 */
const LoadingState = () => (
  <div 
    className="text-center w-full py-1 flex flex-col justify-center items-center z-10"
    data-testid="loyalty-banner-loading"
  >
    <div className="animate-spin mb-1">
      <FaSpinner className="text-[#FF6B00]" size={24} />
    </div>
    <span className="text-xs text-gray-500">Loading VivaBucks rewards...</span>
  </div>
);

/**
 * Main loyalty banner component that displays user's tier and progress
 * @param {Object} props Component properties
 * @param {boolean} [props.forceAnimation=false] - Force animation even if not triggered by an event
 * @param {number} [props.animateEarnedPoints] - If provided, animate these points instead of tier progress
 * @param {Function} props.onProgressBarAnimationComplete - Callback when progress bar animation completes
 * @param {boolean} [props.hideProgressBar=false] - Whether to hide the progress bar
 */
function LoyaltyBanner({ 
  forceAnimation = false, 
  animateEarnedPoints, 
  onProgressBarAnimationComplete,
  hideProgressBar = false
}) {
  const { data: session, status } = useSession();

  // Use the custom hook to get loyalty data
  const { 
    userData,
    progressInfo,
    isLoading
  } = useLoyaltyData();
  
  // Track animation state for deduplication
  const [animationCompleted, setAnimationCompleted] = useState(false);
  
  // Handle animation completion - simplified to avoid duplicate events
  const handleAnimationComplete = () => {
    // Prevent duplicate completions
    if (animationCompleted) return;
    
    // Mark animation as completed
    setAnimationCompleted(true);
    
    // Call the callback directly if provided
    if (typeof onProgressBarAnimationComplete === 'function') {
      try {
        onProgressBarAnimationComplete();
      } catch (error) {
        console.error('Error in animation completion callback:', error);
      }
    }
  };

  // Don't render anything if user is not logged in
  if (status === "loading" || !session) return null;

  // Don't render if userData is not yet loaded
  if (isLoading || !userData) {
    return <LoadingState />;
  }

  // Calculate progress info if it's missing but we have the data to calculate it
  const currentProgressInfo = progressInfo || 
    (userData.cumulativePoints ? calculateProgressToNextTier(userData.cumulativePoints, TIER_CONFIG) : null);

  // Extract values directly from userData provided by the hook
  const currentVivaBucks = userData?.vivaBucks || 0;
  const lifetimeVivaBucks = userData?.cumulativePoints || 0;
  const currentTier = userData?.currentTier || 'BRONZE'; 
  const multiplier = userData?.pointsMultiplier || 1;
  
  // Get background accent color based on tier
  const bannerAccentColor = TIER_COLORS[currentTier]?.bg || TIER_COLORS.BRONZE.bg;

  return (
    <div 
      className="loyalty-banner w-full py-2 px-2 md:px-4 relative overflow-hidden border-b bg-white"
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        minHeight: "65px",
        height: 'auto'
      }}
      data-testid="loyalty-banner"
    >
      {/* Decorative background elements - simplified */}
      <div 
        className="absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 opacity-10 transform rotate-45 translate-x-10 -translate-y-10 z-0"
        aria-hidden="true"
      >
        <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
      </div>
      <div 
        className="absolute bottom-0 left-0 w-10 md:w-16 h-10 md:h-16 opacity-10 transform -rotate-45 -translate-x-6 translate-y-6 z-0"
        aria-hidden="true"
      >
        <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
      </div>

      <div 
        className="flex flex-row justify-between z-10 items-center gap-3 md:gap-8"
        data-testid="loyalty-banner-content"
      >
        {/* Points and tier display */}
        <div className="flex-shrink-0">
          <TierPointsDisplay 
            currentTier={currentTier}
            points={currentVivaBucks}
            multiplier={multiplier}
            compact={true}
          />
        </div>
        
        {/* Progress bar with animation - conditionally rendered */}
        {currentProgressInfo && !hideProgressBar && (
          <div className="w-full max-w-[65%] md:max-w-[60%] flex-grow">
            <ProgressBar 
              progress={animateEarnedPoints ? undefined : currentProgressInfo.progress}
              earnedPoints={animateEarnedPoints}
              currentPoints={lifetimeVivaBucks}
              startPoints={currentProgressInfo.startPoints}
              endPoints={currentProgressInfo.endPoints}
              animate={true}
              forceAnimation={forceAnimation}
              onAnimationComplete={handleAnimationComplete}
              key={`progress-bar-${forceAnimation ? 'forced' : 'normal'}`}
              data-testid="animated-progress-bar"
              compactMode={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Export a memoized version of the component to prevent unnecessary re-renders
export default memo(LoyaltyBanner, (prevProps, nextProps) => {
  // Only re-render if forceAnimation or animateEarnedPoints changes, or if the callback changes
  return (
    prevProps.forceAnimation === nextProps.forceAnimation &&
    prevProps.animateEarnedPoints === nextProps.animateEarnedPoints &&
    prevProps.onProgressBarAnimationComplete === nextProps.onProgressBarAnimationComplete &&
    prevProps.hideProgressBar === nextProps.hideProgressBar
  );
});