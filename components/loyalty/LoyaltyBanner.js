"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

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

export default function LoyaltyBanner() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const { 
    userData,
    progressInfo,
    isLoading, 
    animatePoints,
    isMobile,
    isInitialized
  } = useLoyaltyData();

  if (!mounted || status === "loading" || !session) return null;

  // Extract values with fallbacks
  const currentVivaBucks = userData?.vivaBucks ?? 0;
  const lifetimeVivaBucks = userData?.cumulativePoints ?? 0;
  const currentTier = userData?.currentTier || 'BRONZE';
  const nextTierName = progressInfo?.nextTier ?? 'SILVER';
  const progressPercent = progressInfo?.progress ?? 0;
  const pointsNeeded = progressInfo?.pointsNeeded ?? 0;
  const bannerAccentColor = TIER_COLORS[currentTier]?.bg || TIER_COLORS.BRONZE.bg;

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
            animatePoints={animatePoints}
            isMobile={isMobile}
          />
          
            {progressInfo && (
            <ProgressBar 
              progress={progressPercent}
              currentTier={currentTier}
              nextTier={nextTierName}
              pointsNeeded={pointsNeeded}
              currentPoints={lifetimeVivaBucks}
              startPoints={TIER_CONFIG[currentTier]?.points || 0}
              endPoints={TIER_CONFIG[nextTierName]?.points || lifetimeVivaBucks}
              isMobile={isMobile}
            />
            )}
          </div>
        ) : (
          <LoadingState />
        )}
      </motion.div>
  );
} 