'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp } from 'react-icons/fa';
import { TIER_COLORS } from '../constants/tierConfig';
import { ANIMATIONS } from '../constants/animations';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export default function ProgressBar({
  progress,
  currentTier,
  nextTier,
  pointsNeeded,
  currentPoints,
  startPoints,
  endPoints,
  isMobile = false,
  animate = true
}) {
  const [showLabels, setShowLabels] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(!animate);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowLabels(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const tierColors = TIER_COLORS[currentTier];
  const minProgressWidth = 50;
  const displayProgress = Math.max(
    progress,
    (minProgressWidth / (progressBarRef?.current?.offsetWidth || 300)) * 100
  );

  // Notify parent when animation completes
  const handleAnimationComplete = () => {
    setAnimationComplete(true);
    eventEmitter.emit(Events.PROGRESS_BAR_ANIMATION_COMPLETE, {
      timestamp: Date.now()
    });
  };

  return (
    <div className={`
      ${isMobile ? 'mt-1 w-full' : 'mt-2 md:mt-0 px-1 md:px-3 md:flex-1 md:mx-6'}
      max-w-md
      z-10
    `}>
      {/* Header with Next tier and points needed info */}
      <div className={`
        flex
        justify-between
        items-center
        ${isMobile ? 'mb-1 text-[9px]' : 'mb-1.5 text-xs'}
        text-gray-600
      `}>
        <div className="flex items-center space-x-1">
          <FaArrowUp 
            className="text-[#FF6B00]"
            size={isMobile ? 8 : 10}
          />
          <span className="font-medium">Next: {nextTier}</span>
        </div>
        
        <div className="text-gray-700 font-medium">
          {pointsNeeded > 0 ? (
            <span className="whitespace-nowrap flex items-center">
              <span>{pointsNeeded.toLocaleString()}</span>
              <span className="mx-1">more to</span>
              <span className="text-[#FF6B00] font-semibold">{nextTier}</span>
            </span>
          ) : (
            <span className="text-[#FF6B00]">Max tier reached!</span>
          )}
        </div>
      </div>

      {/* Progress bar container */}
      <div className="relative">
        {/* Points labels */}
        {showLabels && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={`
              flex
              justify-between
              items-center
              ${isMobile ? 'mb-0.5 px-1' : 'mb-1 px-1'}
            `}
          >
            <span className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-gray-500`}>
              {startPoints.toLocaleString()}
            </span>
            <span className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-gray-500`}>
              {endPoints.toLocaleString()}
            </span>
          </motion.div>
        )}

        {/* Progress bar */}
        <div 
          ref={progressBarRef}
          className={`
            w-full
            bg-gray-100
            rounded-full
            ${isMobile ? 'h-6' : 'h-5'}
            shadow-md
            relative
            overflow-hidden
            border
            border-gray-200
          `}
        >
          <motion.div
            initial={animate ? { width: '0%' } : false}
            animate={{ width: `${Math.min(Math.max(displayProgress, 0), 100)}%` }}
            transition={{ 
              duration: 1.5,
              ease: "easeOut",
              delay: 0.3 // Slight delay to ensure proper setup
            }}
            onAnimationComplete={handleAnimationComplete}
            className={`
              h-full
              rounded-full
              relative
              ${tierColors?.progress || 'bg-gray-400'}
            `}
          >
            {showLabels && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.8 }}
                className={`
                  absolute
                  inset-y-0
                  right-0
                  flex
                  items-center
                  ${isMobile ? 'mr-2' : 'mr-3'}
                `}
              >
                <span className={`
                  text-white
                  font-bold
                  ${isMobile ? 'text-sm' : 'text-xs'}
                `}>
                  {currentPoints.toLocaleString()}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Tick marks */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={`
              h-full
              w-full
              flex
              justify-between
              px-6
              ${isMobile ? 'opacity-30' : 'opacity-20'}
            `}>
              {[...Array(isMobile ? 3 : 5)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    h-full
                    ${isMobile ? 'w-0.5' : 'w-px'}
                    bg-black
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lifetime points display */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 1.8 }}
        className={`
          flex
          justify-end
          ${isMobile ? 'mt-1 text-[9px] font-medium' : 'mt-1 text-xs'}
          ${isMobile ? 'text-gray-600' : 'text-gray-500'}
        `}
      >
        <span>
          Lifetime: <span className={isMobile ? 'font-bold' : 'font-medium'}>
            {currentPoints.toLocaleString()}
          </span> VivaBucks
        </span>
      </motion.div>
    </div>
  );
} 