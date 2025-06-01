'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCoins } from 'react-icons/fa';

/**
 * Enhanced Loyalty Progress Bar Component
 * Handles VivaBucks progress animation with proper conflict resolution
 */
export default function LoyaltyProgressBar({
  currentPoints = 0,
  earnedPoints = 0,
  startPoints = 0,
  endPoints = 100,
  animate = false,
  forceAnimation = false,
  onAnimationComplete,
  label = '',
  variant = 'standard', // 'standard', 'compact', 'modal'
  className = ''
}) {
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [showEarnedLabel, setShowEarnedLabel] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [initialProgress, setInitialProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);
  
  // Refs
  const animationTriggeredRef = useRef(false);
  const containerRef = useRef(null);
  
  // Calculate progress values
  const totalRange = endPoints - startPoints;
  const progressPoints = Math.min(Math.max(currentPoints - startPoints, 0), totalRange);
  const progressPercentage = totalRange > 0 ? (progressPoints / totalRange) * 100 : 0;
  const earnedProgressPercentage = totalRange > 0 ? (earnedPoints / totalRange) * 100 : 0;
  
  // Determine if we should trigger animation
  const shouldAnimate = (animate || forceAnimation) && earnedPoints > 0 && !animationTriggeredRef.current;
  
  // Variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          height: 'h-1.5 md:h-2',
          containerPadding: 'p-0',
          labelSize: 'text-xs',
          earnedLabelStyle: 'text-xs px-2 py-1',
          showLabels: true,
          coinSize: 'h-2 w-2 md:h-2.5 md:w-2.5',
          textSize: 'text-xs'
        };
      case 'modal':
        return {
          height: 'h-3 md:h-4',
          containerPadding: 'p-4',
          labelSize: 'text-sm',
          earnedLabelStyle: 'text-sm px-3 py-2',
          showLabels: true,
          coinSize: 'h-3 w-3',
          textSize: 'text-sm'
        };
      default:
        return {
          height: 'h-2 md:h-3',
          containerPadding: 'p-2',
          labelSize: 'text-sm',
          earnedLabelStyle: 'text-sm px-3 py-2',
          showLabels: true,
          coinSize: 'h-2.5 w-2.5',
          textSize: 'text-xs md:text-sm'
        };
    }
  };
  
  const styles = getVariantStyles();
  
  // Animation trigger effect
  useEffect(() => {
    if (shouldAnimate && !animationTriggeredRef.current) {
      console.log('[LoyaltyProgressBar] Starting animation', { earnedPoints, currentPoints });
      
      animationTriggeredRef.current = true;
      setAnimationComplete(false);
      
      // Set initial state (before earned points)
      const beforeEarnedPoints = Math.max(currentPoints - earnedPoints, startPoints);
      const beforeRange = Math.min(Math.max(beforeEarnedPoints - startPoints, 0), totalRange);
      const beforePercentage = totalRange > 0 ? (beforeRange / totalRange) * 100 : 0;
      
      setInitialProgress(beforePercentage);
      setTargetProgress(progressPercentage);
      
      // Start animation sequence
      setTimeout(() => {
        setIsAnimating(true);
        setShowEarnedLabel(true);
      }, 100);
    } else if (!shouldAnimate) {
      // Reset for non-animated state
      setInitialProgress(progressPercentage);
      setTargetProgress(progressPercentage);
    }
  }, [shouldAnimate, earnedPoints, currentPoints, progressPercentage, startPoints, totalRange]);
  
  // Handle animation completion
  const handleProgressAnimationComplete = useCallback(() => {
    console.log('[LoyaltyProgressBar] Progress animation complete');
    
    setTimeout(() => {
      setShowEarnedLabel(false);
      setIsAnimating(false);
      setAnimationComplete(true);
      
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 1500); // Show earned label for 1.5s
  }, [onAnimationComplete]);
  
  // Reset animation state when earnedPoints becomes 0
  useEffect(() => {
    if (earnedPoints === 0 && animationComplete) {
      animationTriggeredRef.current = false;
      setAnimationComplete(false);
      setShowEarnedLabel(false);
      setIsAnimating(false);
    }
  }, [earnedPoints, animationComplete]);
  
  return (
    <div className={`loyalty-progress-container w-full relative ${styles.containerPadding} ${className}`} ref={containerRef}>
      {/* Progress label (top) - simplified for compact variant */}
      {styles.showLabels && label && variant !== 'compact' && (
        <div className="flex justify-between items-center mb-2">
          <span className={`${styles.labelSize} font-medium text-gray-700`}>
            {label}
          </span>
          <span className={`${styles.labelSize} text-gray-500`}>
            {Math.round(targetProgress)}%
          </span>
        </div>
      )}
      
      {/* Progress bar container */}
      <div className="relative">
        {/* Main progress bar */}
        <div className={`
          loyalty-progress-bar w-full ${styles.height} bg-gray-200 rounded-full overflow-visible relative
          shadow-inner border border-gray-300/20
        `}>
          {/* Animated progress fill */}
          <motion.div
            className={`
              loyalty-progress-fill ${styles.height} rounded-full relative overflow-visible
              bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500
              shadow-sm
            `}
            initial={{ 
              width: `${initialProgress}%`
            }}
            animate={{ 
              width: `${targetProgress}%`
            }}
            transition={{
              duration: isAnimating ? 2 : 0,
              ease: "easeOut",
              delay: isAnimating ? 0.5 : 0
            }}
            onAnimationComplete={handleProgressAnimationComplete}
            style={{
              // Force style to override any Tailwind conflicts
              width: isAnimating ? `${targetProgress}%` : `${progressPercentage}%`,
              transition: isAnimating ? 'width 2s ease-out 0.5s' : 'width 0.3s ease'
            }}
          >
            {/* Progress bar shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
            
            {/* Lifetime VivaBucks display within progress bar */}
            <div className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2">
              <span className={`text-white font-bold drop-shadow flex items-center space-x-0.5 md:space-x-1 ${styles.textSize}`}>
                <FaCoins className={`${styles.coinSize} text-yellow-300`} />
                <span>{currentPoints.toLocaleString()}</span>
              </span>
            </div>
          </motion.div>
        </div>
        
        {/* Floating earned points indicator */}
        <AnimatePresence>
          {showEarnedLabel && earnedPoints > 0 && (
            <motion.div
              initial={{ 
                opacity: 0, 
                y: 10, 
                scale: 0.8 
              }}
              animate={{ 
                opacity: 1, 
                y: -20, 
                scale: 1 
              }}
              exit={{ 
                opacity: 0, 
                y: -30, 
                scale: 0.9 
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut"
              }}
              className="
                loyalty-earned-label absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full
                pointer-events-none
              "
              style={{ zIndex: "var(--z-loyalty-earned-label)" }}
            >
              <div className={`
                ${styles.earnedLabelStyle} 
                bg-gradient-to-r from-green-500 to-green-600 
                text-white font-bold rounded-full 
                shadow-lg border-2 border-white
                flex items-center gap-1
              `}>
                <FaCoins className={`${styles.coinSize} text-yellow-300`} />
                <span className={styles.textSize}>+{earnedPoints} VivaBucks!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Bottom labels - showing start and end tier values */}
      {styles.showLabels && (
        <div className="flex justify-between items-center mt-2">
          <span className={`${styles.labelSize} text-gray-500 font-medium`}>
            {startPoints.toLocaleString()}
          </span>
          <span className={`${styles.labelSize} text-gray-500 text-center flex-1`}>
            {earnedPoints > 0 ? 
              `${(endPoints - currentPoints).toLocaleString()} more to next tier` :
              `${(endPoints - currentPoints).toLocaleString()} points needed`
            }
          </span>
          <span className={`${styles.labelSize} text-gray-500 font-medium`}>
            {endPoints.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
} 