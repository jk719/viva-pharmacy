'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

/**
 * Tier Progress Bar Component
 * Visual representation of progress towards the next loyalty tier with animation support
 *
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {number} props.currentPoints - Current total points
 * @param {number} props.startPoints - Starting points for the current tier range
 * @param {number} props.endPoints - Ending points for the current tier range
 * @param {number} [props.earnedPoints] - Recently earned points to animate
 * @param {string} [props.label] - Text label for the progress bar
 * @param {boolean} [props.animate=false] - Whether to animate the progress bar
 * @param {boolean} [props.forceAnimation=false] - Force animation even if not triggered by a points update
 * @param {function} [props.onAnimationComplete] - Callback when animation completes
 * @param {string} [props.variant="standard"] - Visual variant of the progress bar (standard, compact)
 */
export default function TierProgressBar({
  progress = 0,
  currentPoints = 0,
  startPoints = 0,
  endPoints = 100,
  earnedPoints = 0,
  label = '',
  animate = false,
  forceAnimation = false,
  onAnimationComplete,
  variant = 'standard'
}) {
  // Animation controls
  const controls = useAnimation();
  const coinControls = useAnimation();
  
  // State for animation
  const [initialProgress, setInitialProgress] = useState(progress);
  const [animationTriggered, setAnimationTriggered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  
  // Track animation
  const initializedRef = useRef(false);
  const progressBarRef = useRef(null);
  
  // Calculate visual values
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const displayProgress = Math.round(clampedProgress);
  const pointsNeeded = endPoints - currentPoints;
  
  // Visual style based on variant
  const isCompact = variant === 'compact';
  const height = isCompact ? 'h-2' : 'h-6';
  const barBorderRadius = isCompact ? 'rounded-full' : 'rounded-md';
  
  // Set up animation sequence
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setInitialProgress(progress - (earnedPoints ? (earnedPoints / (endPoints - startPoints)) * 100 : 0));
      
      // Immediately set progress for initial render without animation
      controls.set({ width: `${clampedProgress}%` });
      return;
    }
    
    // Check if animation should be triggered
    if ((animate || forceAnimation) && !animationTriggered) {
      console.log('[TierProgressBar] Starting animation sequence', {
        initialProgress,
        targetProgress: clampedProgress,
        earnedPoints
      });
      
      setAnimationTriggered(true);
      setAnimationComplete(false);
      
      // Animation sequence:
      // 1. Show coins if there are earned points
      if (earnedPoints > 0) {
        setShowCoins(true);
        
        // Animate coins first then progress bar
        coinControls.start({
          y: [0, -20, 0],
          opacity: [0, 1, 0],
          scale: [0.8, 1.2, 1],
          transition: { duration: 1.5 }
        }).then(() => {
          // 2. Animate progress bar
          controls.start({
            width: `${clampedProgress}%`,
            transition: { duration: 1.5, ease: "easeOut" }
          }).then(() => {
            // 3. Mark as complete after animations
            setAnimationComplete(true);
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          });
        });
      } else {
        // Just animate progress bar if no earned points
        controls.start({
          width: `${clampedProgress}%`,
          transition: { duration: 1.5, ease: "easeOut" }
        }).then(() => {
          setAnimationComplete(true);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        });
      }
    }
  }, [
    animate, 
    forceAnimation, 
    animationTriggered, 
    clampedProgress, 
    controls, 
    coinControls, 
    earnedPoints, 
    initialProgress,
    onAnimationComplete,
    progress
  ]);
  
  // Reset animation state when earned points changes to 0
  useEffect(() => {
    if (animationComplete && earnedPoints === 0) {
      setAnimationTriggered(false);
    }
  }, [animationComplete, earnedPoints]);
  
  return (
    <div className="w-full">
      {/* Label above progress bar (if not compact) */}
      {!isCompact && label && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{label}</span>
          <span>{displayProgress}%</span>
        </div>
      )}
      
      {/* Progress bar container */}
      <div 
        className={`w-full ${height} bg-gray-200 ${barBorderRadius} overflow-hidden relative`}
        ref={progressBarRef}
      >
        {/* Progress bar fill */}
        <motion.div
          className={`h-full bg-gradient-to-r from-amber-400 to-orange-500 ${barBorderRadius}`}
          initial={{ width: `${initialProgress}%` }}
          animate={controls}
        />
        
        {/* Coins animation */}
        <AnimatePresence>
          {showCoins && earnedPoints > 0 && (
            <motion.div
              className="absolute top-0 right-0 transform -translate-y-full mt-2"
              animate={coinControls}
              onAnimationComplete={() => setShowCoins(false)}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                <span className="mr-1">+</span>
                <span>{earnedPoints}</span>
                <span className="ml-1">✦</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress text below (if compact) */}
      {isCompact && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{startPoints.toLocaleString()}</span>
          <span>{label || `${pointsNeeded.toLocaleString()} points to next tier`}</span>
          <span>{endPoints.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
} 