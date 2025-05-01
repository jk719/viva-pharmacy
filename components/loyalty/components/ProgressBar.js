'use client';

import { useEffect, useState, useRef, memo } from 'react';
import eventEmitter, { Events } from '@/lib/eventEmitter';

/**
 * Animated progress bar component for loyalty tier progression
 * @param {Object} props Component properties
 * @param {number} [props.progress] - The progress percentage (0-100), used if earnedPoints is not provided
 * @param {number} [props.earnedPoints] - If provided, animate these points specifically
 * @param {number} props.currentPoints - Current total points value
 * @param {number} props.startPoints - Starting points value for this tier
 * @param {number} props.endPoints - Ending points value for this tier
 * @param {boolean} props.animate - Whether to animate the progress bar
 * @param {Function} props.onAnimationComplete - Callback when animation completes
 * @param {boolean} props.forceAnimation - Force animation even if animate is false
 */
function ProgressBar({
  progress, // Can be undefined if earnedPoints is used
  earnedPoints, // New prop
  currentPoints = 0,
  startPoints = 0,
  endPoints = 100,
  animate = false,
  onAnimationComplete,
  forceAnimation = false
}) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(progress, 100));
  
  // Calculate display values for high-point users (above 10,000)
  const showExtendedTier = currentPoints >= 10000;
  const extendedTierStart = showExtendedTier ? Math.floor(currentPoints / 2000) * 2000 : startPoints;
  const extendedTierEnd = showExtendedTier ? extendedTierStart + 2000 : endPoints;
  
  // Use either standard tier or extended tier based on points
  const displayStartPoints = showExtendedTier ? extendedTierStart : startPoints;
  const displayEndPoints = showExtendedTier ? extendedTierEnd : endPoints;
  
  // Calculate progress percentage for display
  const displayProgress = showExtendedTier
    ? Math.min(100, Math.max(0, ((currentPoints - displayStartPoints) / (displayEndPoints - displayStartPoints)) * 100))
    : clampedProgress;
  
  // Track animation state
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showEarnedPoints, setShowEarnedPoints] = useState(false); // State for showing earned points indicator
  const animationRef = useRef(null);
  const animationCompleted = useRef(false);
  
  // Determine if we should animate
  // Prioritize animating earned points if provided and forced
  const shouldAnimateEarned = forceAnimation && typeof earnedPoints === 'number';
  const shouldAnimateProgress = forceAnimation || (animate && displayProgress >= 0);
  const shouldAnimate = shouldAnimateEarned || shouldAnimateProgress;
  
  // Use a ref to track if this is the first mount
  const isFirstMount = useRef(true);
  
  useEffect(() => {
    // Move forceAnimation log here to avoid logging on every render
    if (forceAnimation) {
      // console.log('🚀 Force animation enabled');
    }

    // Skip animation if not needed or if this is a re-render but not a force animation
    if (!shouldAnimate || (!isFirstMount.current && !forceAnimation)) {
      setAnimatedProgress(displayProgress); // Set final progress if not animating
      return;
    }
    
    // Mark that we've mounted
    isFirstMount.current = false;
    
    // --- Animation Logic --- 
    let startTime;
    const ANIMATION_DURATION = shouldAnimateEarned ? 1500 : 2400;
    let timeoutRef = null;
    
    // --- MODIFICATION START: Set indicator true immediately if animating earned points --- 
    setShowEarnedPoints(shouldAnimateEarned);
    // --- MODIFICATION END ---

    // Cancel existing animation & timeouts
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    timeoutRef = setTimeout(() => {
      if (!animationCompleted.current) {
        // console.log('⚠️ Animation safety timeout triggered');
        completeAnimation();
      }
    }, ANIMATION_DURATION + 500);
    
    // Function to handle animation completion
    const completeAnimation = () => {
      if (animationCompleted.current) return;
      animationCompleted.current = true;
      
      setAnimatedProgress(displayProgress); 
      // --- MODIFICATION START: Ensure indicator is hidden on completion --- 
      setShowEarnedPoints(false); 
      // --- MODIFICATION END ---
      
      // console.log('✅ Progress bar animation completed');
      
      if (typeof onAnimationComplete === 'function') {
        // console.log('📣 Calling onAnimationComplete callback');
        try { onAnimationComplete(); } catch (error) { console.error('Error in animation complete callback:', error); }
      }
    };
    
    // Animation frame callback
    const animateFrame = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressRatio = Math.min(elapsed / ANIMATION_DURATION, 1);
      
      if (shouldAnimateEarned) {
        // Indicator visibility is now handled outside the loop
        // Keep the main progress bar static
        setAnimatedProgress(displayProgress);
      } else {
        // Animate the progress bar itself
        const easedProgressRatio = 1 - Math.pow(1 - progressRatio, 2);
        const newProgress = easedProgressRatio * displayProgress;
        setAnimatedProgress(newProgress);
      }
      
      if (progressRatio < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        completeAnimation();
      }
    };
    
    // Start the animation
    animationRef.current = requestAnimationFrame(animateFrame);
    
    // Cleanup
    return () => {
      // console.log('🧹 Cleaning up progress bar animation resources');
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      clearTimeout(timeoutRef);
    };
  }, [progress, currentPoints, startPoints, endPoints, animate, forceAnimation, earnedPoints, onAnimationComplete]); // Add earnedPoints to dependency array

  // Determine final width for the bar (use displayProgress if not animating earned points)
  const barWidthPercent = shouldAnimateEarned ? displayProgress : (shouldAnimate ? animatedProgress : displayProgress);

  return (
    <div className="w-full py-2 relative" data-testid="loyalty-progress-bar">
      {/* Start and End Points */}
        <div className="text-xs md:text-sm font-medium text-slate-600 flex justify-between mt-1">
          <span>{displayStartPoints.toLocaleString()}</span>
          <span>{displayEndPoints.toLocaleString()}</span>
        </div>
        {showExtendedTier && (
          <div className="text-xs text-slate-500 mt-1 text-center">
            {currentPoints >= 10000 ? "Extended Tier" : ""}
          </div>
        )}
      
      {/* Bar Container */}
      <div className="relative w-full h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        {/* Filled Bar */}
        <div
          className="absolute top-0 left-0 h-full rounded-full overflow-hidden transition-all duration-500"
          style={{
            width: `${barWidthPercent}%`, // Use calculated width
            background: 'linear-gradient(90deg, #FFB347 0%, #FF9B10 50%, #FF6B00 100%)',
            boxShadow: '0 2px 8px rgba(255,107,0,0.4)',
            transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          data-testid="loyalty-progress-bar-fill"
          data-animate={shouldAnimate ? 'true' : 'false'}
        >
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white font-bold text-xs drop-shadow">
            {currentPoints.toLocaleString()}
          </span>
        </div>
        
        {/* Earned Points Indicator */}
        {shouldAnimateEarned && showEarnedPoints && (
          <div 
            className="absolute top-[-25px] left-1/2 -translate-x-1/2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded shadow-lg animate-bounce"
            data-testid="earned-points-indicator"
          >
            + {earnedPoints} VivaBucks!
          </div>
        )}

        {/* Tick marks */}
        <div className="absolute inset-0 flex justify-between pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-full w-px bg-white opacity-30" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Memoize the component
export default memo(ProgressBar, (prevProps, nextProps) => {
  const criticalPropsEqual = 
    prevProps.progress === nextProps.progress &&
    prevProps.earnedPoints === nextProps.earnedPoints &&
    prevProps.currentPoints === nextProps.currentPoints &&
    prevProps.startPoints === nextProps.startPoints &&
    prevProps.endPoints === nextProps.endPoints &&
    prevProps.animate === nextProps.animate;
  
  return criticalPropsEqual;
});