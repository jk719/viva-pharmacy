'use client';

import { useEffect, useState, useRef } from 'react';
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
export default function ProgressBar({
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
  
  // Track animation state
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const animationRef = useRef(null);
  const animationCompleted = useRef(false);
  
  // Determine if we should animate
  const shouldAnimate = animate || forceAnimation;
  
  useEffect(() => {
    // Skip animation if not needed
    if (!shouldAnimate) {
      setAnimatedProgress(clampedProgress);
      return;
    }
    
    console.log('🎬 Starting loyalty progress bar animation from 0 to', clampedProgress);
    let startTime;
    const ANIMATION_DURATION = 2000; // 2 seconds animation
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Reset animation state
    setAnimatedProgress(0);
    animationCompleted.current = false;
    
    // Animation frame callback
    const animateProgress = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      
      // Calculate eased progress (ease out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const newProgress = easedProgress * clampedProgress;
      
      setAnimatedProgress(newProgress);
      
      if (progress < 1) {
        // Continue animation
        animationRef.current = requestAnimationFrame(animateProgress);
      } else {
        // Animation complete
        if (!animationCompleted.current) {
          animationCompleted.current = true;
          console.log('✅ Loyalty progress bar animation completed');
          
          // Call the callback if provided
          if (typeof onAnimationComplete === 'function') {
            console.log('📣 Calling onAnimationComplete callback');
            onAnimationComplete();
          }
          
          // Emit a single consolidated animation complete event
          // We only use LOYALTY_ANIMATION_COMPLETE to avoid confusion and duplicate handlers
          console.log('📣 Emitting LOYALTY_ANIMATION_COMPLETE event');
          eventEmitter.emit(Events.LOYALTY_ANIMATION_COMPLETE, {
            timestamp: Date.now(),
            source: 'progress_bar',
            animationType: 'loyalty_points',
            completed: true
          });
          
          // Note: We've removed the duplicate PROGRESS_BAR_ANIMATION_COMPLETE emission
          // to prevent confusion and multiple handlers firing for the same animation
        }
      }
    };
    
    // Start the animation
    animationRef.current = requestAnimationFrame(animateProgress);
    
    // Cleanup animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [clampedProgress, shouldAnimate, onAnimationComplete]);

  return (
    <div className="w-full py-2" data-testid="loyalty-progress-bar">
      {/* Start and End Points */}
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{startPoints.toLocaleString()}</span>
        <span>{endPoints.toLocaleString()}</span>
      </div>
      
      {/* Bar Container */}
      <div className="relative w-full h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        {/* Filled Bar */}
        <div
          className="absolute top-0 left-0 h-full rounded-full overflow-hidden transition-all duration-300"
          style={{
            width: `${shouldAnimate ? animatedProgress : clampedProgress}%`,
            background: 'linear-gradient(90deg, #FFB347 0%, #FF6B00 100%)',
            boxShadow: '0 2px 8px rgba(255,107,0,0.4)'
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