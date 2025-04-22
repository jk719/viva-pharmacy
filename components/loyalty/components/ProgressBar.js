'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FaArrowUp } from 'react-icons/fa';
import { TIER_COLORS } from '../constants/tierConfig';
import { ANIMATIONS } from '../constants/animations';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export default function ProgressBar(props) {
  const {
    progress,
    currentPoints,
    startPoints,
    endPoints,
    isMobile = false,
    animate = false,
    onAnimationComplete
  } = props;

  // Animation controls
  const controls = useAnimation();
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(progress, 100));

  // Track prop changes for debugging
  useEffect(() => {
    console.log('📈 ProgressBar props received:', {
      animate,
      progress,
      currentPoints,
      hasCallback: typeof onAnimationComplete === 'function',
      timestamp: new Date().toISOString()
    });
  }, [animate, progress, currentPoints, onAnimationComplete]);

  // Run animation when animate prop changes
  useEffect(() => {
    if (animate) {
      console.log('🚀 STARTING PROGRESS BAR ANIMATION with progress:', {
        clampedProgress,
        animate,
        animationComplete,
        timestamp: new Date().toISOString()
      });
      
      // Important: Set animationComplete to false when starting new animation
      setAnimationComplete(false);
      
      // Start with 0% and animate to the target progress
      controls.start({ 
        width: `${clampedProgress}%`,
        transition: { 
          duration: 1.2, // Faster animation
          ease: "easeOut",
          // Add a slight bounce at the end for more visual impact
          type: "spring",
          damping: 12,
          stiffness: 100
        } 
      }).then(() => {
        // This is a backup in case onAnimationComplete doesn't fire
        console.log('👀 Animation controls.start promise resolved');
      });
    } else {
      // If not animating, just set to the current progress immediately
      console.log('📤 Not animating, setting progress directly:', clampedProgress);
      controls.set({ width: `${clampedProgress}%` });
    }
  }, [animate, clampedProgress, controls]);

  return (
    <div className="w-full py-2">
      {/* Start and End Points */}
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{startPoints.toLocaleString()}</span>
        <span>{endPoints.toLocaleString()}</span>
      </div>
      {/* Bar Container */}
      <div className="relative w-full h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        {/* Filled Bar */}
        <motion.div
          initial={{ width: animate ? '0%' : `${clampedProgress}%` }}
          animate={controls}
          // Animation is controlled in the useEffect
          className="absolute top-0 left-0 h-full rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #FFB347 0%, #FF6B00 100%)',
            boxShadow: '0 2px 8px rgba(255,107,0,0.4)'
          }}
          onAnimationComplete={() => {
            console.log('🎉 PROGRESS BAR ANIMATION COMPLETED! State:', { 
              alreadyCompleted: animationComplete,
              timestamp: new Date().toISOString()
            });
            
            if (animationComplete) {
              console.log('⚠️ Animation completion already processed, skipping callback');
              return; // Prevent duplicate callbacks
            }
            
            // Set local state first
            setAnimationComplete(true);
            
            // Small delay before calling parent callback for more reliable state updates
            setTimeout(() => {
              console.log('💢 Calling parent callback for animation completion');
              if (typeof onAnimationComplete === 'function') {
                // Call the callback only, let parent components handle event emission
                onAnimationComplete();
              } else {
                console.warn('⚠️ No animation completion callback provided!');
              }
            }, 50);
          }}
        >
          {/* Add animated glow effect inside the progress bar */}
          {animate && (
            <motion.div 
              className="absolute inset-0 opacity-70"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
                width: '50%',
                transform: 'skewX(-20deg)'
              }}
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut"
              }}
            />
          )}
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white font-bold text-xs drop-shadow">
            {currentPoints.toLocaleString()}
          </span>
        </motion.div>
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