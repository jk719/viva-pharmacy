"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import eventEmitter, { Events } from '@/lib/eventEmitter';

// Import components
import TierIcon from './components/TierIcon';
import ProgressBar from './components/ProgressBar';
import TierPointsDisplay from './components/TierPointsDisplay';
import TierBadge from './components/TierBadge';

// Import hooks and constants
import useLoyaltyData from './hooks/useLoyaltyData';
import { TIER_COLORS, TIER_CONFIG } from './constants/tierConfig';
import { ANIMATIONS } from './constants/animations';

// Loading state component
const LoadingState = () => (
  <div className="text-center w-full py-2 flex flex-col justify-center items-center z-10">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <FaSpinner className="text-[#FF6B00] mb-2" size={28} />
    </motion.div>
    <span className="text-xs text-gray-500">Loading VivaBucks rewards...</span>
  </div>
);

export default function LoyaltyBanner({ 
  onProgressBarAnimationComplete, 
  forceAnimation: forceProp = false,
  animationPoints = 0,
  debugMode = false
}) {
  console.log('💬 LoyaltyBanner rendered with props:', {
    hasCallback: !!onProgressBarAnimationComplete,
    forceProp,
    animationPoints,
    debugMode,
    timestamp: new Date().toISOString()
  });
  const { data: session, status } = useSession();
  const [forceAnimation, setForceAnimation] = useState(forceProp || false);
  const [animationCallbackFired, setAnimationCallbackFired] = useState(false);
  const [animateProgressBar, setAnimateProgressBar] = useState(false);
  const [pointsOverride, setPointsOverride] = useState(0);

  const { 
    userData,
    progressInfo,
    isLoading, 
    animatePoints,
    isMobile,
    isInitialized
  } = useLoyaltyData();
  
  // Animation control logic
  useEffect(() => {
    // Force the animation if the prop is set
    if (forceProp) {
      console.log('🚀 Forcing loyalty animation!', { 
        forceProp, 
        animationPoints,
        callbackDefined: typeof onProgressBarAnimationComplete === 'function'
      });
      
      // Define shouldAnimate derived variable
      const shouldAnimate = animateProgressBar || forceAnimation || (animationPoints > 0);
  
      // Debug the animation state
      if (debugMode) {
        console.log('🔄 LoyaltyBanner animation state:', { 
          forceAnimation, 
          animateProgressBar,
          animationPoints,
          shouldAnimate,
          timestamp: new Date().toISOString()
        });
      }
      
      // Ensure we set both state variables for animation
      setForceAnimation(true);
      
      // Only animate the progress bar if we have points to add
      if (animationPoints > 0) {
        console.log('📊 Setting animateProgressBar to true with', animationPoints, 'points');
        setAnimateProgressBar(true);
        
        // Set a safety timeout to call the completion callback
        // This ensures the animation completes even if the CSS animation fails
        const safetyTimeout = setTimeout(() => {
          if (typeof onProgressBarAnimationComplete === 'function') {
            console.log('⏱️ Safety timeout triggered for animation completion');
            onProgressBarAnimationComplete();
          }
        }, 8000); // 8 seconds safety timeout (animation should be ~5s)
        
        return () => clearTimeout(safetyTimeout);
      }
    }
  }, [forceProp, animationPoints, onProgressBarAnimationComplete]);

  // Extra effect to ensure animation triggers when props change
  useEffect(() => {
    if (forceProp || animationPoints > 0) {
      console.log('🚀 Animation trigger detected:', { forceProp, animationPoints });
      setAnimateProgressBar(true);
    }
  }, [forceProp, animationPoints]);

  // Update forceAnimation state when forceProp changes
  useEffect(() => {
    if (forceProp) {
      console.log('👁 forceAnimation prop changed to true, triggering animation');
      setForceAnimation(true);
      
      // If animation points provided, override points for animation
      if (animationPoints > 0) {
        console.log('📈 Using provided animation points:', animationPoints);
        console.log('🌟 ANIMATION OVERRIDE ACTIVE with points:', animationPoints);
        
        // Set override points - this will be used for display
        setPointsOverride(animationPoints);
        
        // Force refresh of loyalty data
        if (typeof window !== 'undefined') {
          console.log('🔄 Forcing refresh of loyalty data due to animation points');
          // Fetch fresh data to ensure points are updated
          fetch('/api/user/profile', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            cache: 'no-store'
          }).then(response => {
            if (response.ok) {
              console.log('✅ Successfully fetched fresh loyalty data');
              return response.json();
            }
            throw new Error('Failed to fetch loyalty data');
          }).catch(err => {
            console.error('Error refreshing loyalty data:', err);
          });
        }
      }
      
      // Reset the callback fired state to ensure we can trigger it again
      setAnimationCallbackFired(false);
      
      if (debugMode) {
        console.log('🔧 DEBUG MODE ENABLED - animation forced with explicit parameters');
      }
    }
  }, [forceProp, animationPoints, debugMode]);

  // Listen for loyalty update events that might include forceAnimation flag
  useEffect(() => {
    const handleLoyaltyUpdate = (data) => {
      console.log('🔄 LOYALTY UPDATE received in banner:', data);
      if (data && data.forceAnimation) {
        console.log('🎬 FORCE ANIMATION FLAG detected in event, triggering animation!');
        setForceAnimation(true);
        // Reset the callback fired state to ensure we can trigger it again
        setAnimationCallbackFired(false);
      }
    };
    
    // Add event listener
    eventEmitter.on(Events.LOYALTY_UPDATE, handleLoyaltyUpdate);
    
    // Cleanup
    return () => {
      eventEmitter.off(Events.LOYALTY_UPDATE, handleLoyaltyUpdate);
    };
  }, []);

  if (status === "loading" || !session) return null;

  // Extract values with fallbacks
  const currentVivaBucks = userData?.vivaBucks ?? 0;
  
  // Calculate points for display - prioritize animation points when provided
  let lifetimeVivaBucks = userData?.cumulativePoints ?? 0;
  const shouldAnimate = animateProgressBar || forceAnimation || (animationPoints > 0) || animatePoints;
  
  // Debug animation state if debug mode is on
  if (debugMode) {
    console.log('🔄 LoyaltyBanner rendering with animation state:', { 
      forceAnimation, 
      animateProgressBar,
      animationPoints,
      animatePoints,
      shouldAnimate, 
      timestamp: new Date().toISOString(),
      callbackDefined: typeof onProgressBarAnimationComplete === 'function'
    });
  }
  

  
  // Always use the most up-to-date values when animation points are provided
  if (animationPoints > 0 && pointsOverride > 0) {
    lifetimeVivaBucks = Math.max(
      (userData?.cumulativePoints ?? 0), 
      (userData?.cumulativePoints ?? 0) + pointsOverride
    );
    // Force animation when animation points are provided
    shouldAnimate = true;
    
    console.log('🎉 Animation should trigger because animationPoints > 0:', animationPoints);
  }
    
  // Log current point state for debugging
  console.log('💰 Current points state:', {
    currentVivaBucks,
    lifetimeVivaBucks,
    cumulativePoints: userData?.cumulativePoints,
    animationPoints,
    override: pointsOverride,
    shouldAnimate,
    forceProp,
    forceState: forceAnimation,
    animatePoints
  });
  const currentTier = userData?.currentTier || 'BRONZE';
  const nextTierName = progressInfo?.nextTier ?? 'SILVER';
  const progressPercent = progressInfo?.progress ?? 0;
  const pointsNeeded = progressInfo?.pointsNeeded ?? 0;
  const bannerAccentColor = TIER_COLORS[currentTier]?.bg || TIER_COLORS.BRONZE.bg;

  const handleProgressBarAnimationEnd = () => {
    console.log('🎉 Progress bar animation ended');
    setAnimateProgressBar(false);
    
    // Only call the callback if it hasn't been called yet
    if (typeof onProgressBarAnimationComplete === 'function') {
      console.log('📞 Calling onProgressBarAnimationComplete callback');
      try {
        onProgressBarAnimationComplete();
        
        // Also emit an event as a redundant trigger mechanism
        if (typeof window !== 'undefined') {
          console.log('📡 Emitting loyalty animation complete event');
          eventEmitter.safeEmit(Events.LOYALTY_ANIMATION_COMPLETE, { 
            timestamp: Date.now(),
            points: animationPoints
          });
          
          // Use a regular DOM event as another fallback
          const event = new CustomEvent('loyalty-animation-complete', { 
            detail: { timestamp: Date.now(), points: animationPoints } 
          });
          window.dispatchEvent(event);
        }
      } catch (err) {
        console.error('❌ Error in animation complete callback:', err);
      }
    } else {
      console.warn('⚠️ No animation complete callback provided');
      
      // Emit the event anyway as a fallback
      if (typeof window !== 'undefined') {
        eventEmitter.safeEmit(Events.LOYALTY_ANIMATION_COMPLETE, { 
          timestamp: Date.now(),
          points: animationPoints
        });
      }
    }
  };

  return (
      <motion.div 
      {...ANIMATIONS.fadeIn}
        className="loyalty-banner w-full py-1 md:py-2 px-2 md:px-6 relative overflow-hidden border-b"
        style={{
          background: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        minHeight: isMobile ? '70px' : '90px',
          height: 'auto'
        }}
      >
        {/* Decorative background elements */}
        <div className={`absolute top-0 right-0 ${isMobile ? 'w-20 h-20' : 'w-32 h-32'} opacity-10 transform rotate-45 translate-x-12 -translate-y-12 z-0`}>
          <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
        </div>
        <div className={`absolute bottom-0 left-0 ${isMobile ? 'w-12 h-12' : 'w-24 h-24'} opacity-10 transform -rotate-45 -translate-x-8 translate-y-8 z-0`}>
          <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
        </div>

        {userData ? (
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row flex-wrap'} justify-between z-10 ${isMobile ? 'items-start' : 'items-center'}`}>
          <TierPointsDisplay 
            currentTier={currentTier}
            points={currentVivaBucks}
            multiplier={userData?.multiplier || 1}
            animate={animatePoints}
            isMobile={isMobile}
          />
          
            {progressInfo && (
            <ProgressBar 
              key={`pb-${currentTier}-${progressPercent}-${lifetimeVivaBucks}-${forceAnimation ? 'animate' : 'static'}`}
              animationKey={`pb-${currentTier}-${progressPercent}-${lifetimeVivaBucks}-${forceAnimation ? 'animate' : 'static'}`}
              progress={progressPercent}
              currentTier={currentTier}
              nextTier={nextTierName}
              pointsNeeded={pointsNeeded}
              currentPoints={lifetimeVivaBucks}
              startPoints={progressInfo.startPoints}
              endPoints={progressInfo.endPoints}
              isMobile={isMobile}
              animate={animateProgressBar}
              onAnimationComplete={handleProgressBarAnimationEnd}
            />
            )}
          </div>
        ) : (
          <LoadingState />
        )}
      </motion.div>
  );
} 