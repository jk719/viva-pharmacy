'use client';

import { useEffect, useState, useRef, memo } from 'react';
import eventEmitter, { Events } from '@/lib/eventEmitter';

/**
 * Animated progress bar component for loyalty tier progression
 * @param {Object} props Component properties
 * @param {number} props.progress - The progress percentage (0-100)
 * @param {number} props.currentPoints - Current points value
 * @param {number} props.startPoints - Starting points value for this tier
 * @param {number} props.endPoints - Ending points value for this tier
 * @param {boolean} props.animate - Whether to animate the progress bar
 * @param {Function} props.onAnimationComplete - Callback when animation completes
 * @param {boolean} props.forceAnimation - Force animation even if animate is false
 */
function ProgressBar({
  progress,
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
  const animationRef = useRef(null);
  const animationCompleted = useRef(false);
  
  // Determine if we should animate - treat 0 as valid starting point
  const shouldAnimate = (animate || forceAnimation) && displayProgress >= 0;
  
  // Use a ref to track if this is the first mount
  const isFirstMount = useRef(true);
  
  useEffect(() => {
    // Skip animation if not needed or if this is a re-render but not a force animation
    if (!shouldAnimate || (!isFirstMount.current && !forceAnimation)) {
      setAnimatedProgress(displayProgress);
      return;
    }
    
    // Mark that we've mounted
    isFirstMount.current = false;
    
    console.log('🎬 Starting loyalty progress bar animation from 0 to', displayProgress, 
      showExtendedTier ? `(Extended tier: ${displayStartPoints} to ${displayEndPoints})` : '');
    let startTime;
    const ANIMATION_DURATION = 2400; // 2.4 seconds animation - slower for smoother effect
    let timeoutRef = null; // Backup timeout reference
    
    // Helper to clear timeouts - define this BEFORE calling it
    const clearExistingTimeouts = () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
        timeoutRef = null;
      }
    };
    
    // Ensure we start with clean animation state
    // Cancel any existing animation FIRST before resetting state
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Clear any existing safety timeouts
    clearExistingTimeouts();
    
    // Reset animation state AFTER canceling animation frame
    setAnimatedProgress(0);
    animationCompleted.current = false;
    
    // Log animation start for debugging
    console.log(`📊 Animation initialized: shouldAnimate=${shouldAnimate}, forceAnimation=${forceAnimation}`);
    
    // Set a safety fallback timeout in case animation frame callbacks fail
    // This ensures the animation completion events will fire even if requestAnimationFrame fails
    const SAFETY_TIMEOUT = ANIMATION_DURATION + 500; // animation + 500ms buffer
    timeoutRef = setTimeout(() => {
      if (!animationCompleted.current) {
        console.log('⚠️ Animation safety timeout triggered - animation may have stalled');
        completeAnimation();
      }
    }, SAFETY_TIMEOUT);
    
    // Function to handle animation completion and event emission
    // Make this callback idempotent (can be called multiple times safely)
    const completeAnimation = () => {
      // Prevent duplicate calls
      if (animationCompleted.current) {
        console.log('🛑 Animation already completed, ignoring repeat call');
        return;
      }
      
      // Mark as completed first to prevent race conditions
      animationCompleted.current = true;
      
      // Ensure progress is visually complete
      setAnimatedProgress(displayProgress);
      console.log('✅ Loyalty progress bar animation completed');
      
      // ONLY call the callback OR emit event, not both
      // This is to prevent duplicate notifications
      if (typeof onAnimationComplete === 'function') {
        console.log('📣 Calling onAnimationComplete callback');
        try {
          // Call the callback, which should handle all necessary state updates
          onAnimationComplete();
        } catch (error) {
          console.error('Error in animation complete callback:', error);
          // Only fall back to event emission if callback fails
          emitCompletionEvent();
        }
      } else {
        // No callback provided, so emit the event
        emitCompletionEvent();
      }
    };
    
    // Separate event emission to avoid duplication
    const emitCompletionEvent = () => {
      console.log('📣 Emitting LOYALTY_ANIMATION_COMPLETE event');
      try {
        eventEmitter.emit(Events.LOYALTY_ANIMATION_COMPLETE, {
          timestamp: Date.now(),
          source: 'progress_bar',
          animationType: 'loyalty_points',
          completed: true,
          absolutePriority: true // Signal to event system this is critical
        });
      } catch (error) {
        console.error('Error emitting animation complete event:', error);
      }
    };
    
    // Animation frame callback
    const animateProgress = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      
      // Calculate eased progress (smoother ease out with slight bounce)
      // Using a custom easing function that starts slow, speeds up, then gently eases at the end
      let easedProgress;
      if (progress < 0.2) {
        // Slow start (ease-in)
        easedProgress = 2.5 * Math.pow(progress, 2);
      } else if (progress > 0.85) {
        // Gentle finish with tiny bounce
        const p = (progress - 0.85) / 0.15;
        easedProgress = 0.85 + 0.15 * (1 - Math.pow(1 - p, 3));
        // Add subtle bounce effect near the end
        if (p > 0.5 && p < 0.9) {
          easedProgress += Math.sin(p * Math.PI) * 0.01;
        }
      } else {
        // Middle part (smooth acceleration)
        const p = (progress - 0.2) / 0.65;
        easedProgress = 0.1 + 0.75 * p;
      }
      
      // Calculate the current progress value
      const newProgress = easedProgress * displayProgress;
      
      setAnimatedProgress(newProgress);
      
      if (progress < 1) {
        // Continue animation
        animationRef.current = requestAnimationFrame(animateProgress);
      } else {
        // Complete immediately
        completeAnimation();
      }
    };
    
    // Start the animation
    animationRef.current = requestAnimationFrame(animateProgress);
    
    // Cleanup animation on unmount and when dependencies change
    return () => {
      console.log('🧹 Cleaning up progress bar animation resources');
      // Cancel any running animation frames
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Clear any safety timeouts
      clearExistingTimeouts();
    };
  }, [clampedProgress, shouldAnimate, onAnimationComplete]);

  return (
    <div className="w-full py-2" data-testid="loyalty-progress-bar">
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
            width: `${shouldAnimate ? animatedProgress : clampedProgress}%`,
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

// Memoize the component to prevent unnecessary re-renders
export default memo(ProgressBar, (prevProps, nextProps) => {
  // Only re-render if critical props change
  const criticalPropsEqual = 
    prevProps.progress === nextProps.progress &&
    prevProps.currentPoints === nextProps.currentPoints &&
    prevProps.startPoints === nextProps.startPoints &&
    prevProps.endPoints === nextProps.endPoints &&
    prevProps.animate === nextProps.animate;
  
  // Always re-render if forceAnimation is true
  if (nextProps.forceAnimation) {
    return false; // Do not memoize, force a re-render
  }
  
  return criticalPropsEqual;
});