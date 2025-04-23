"use client";

import { useSession } from "next-auth/react";
import { FaSpinner } from 'react-icons/fa';

// Import components
import ProgressBar from './components/ProgressBar';
import TierPointsDisplay from './components/TierPointsDisplay';

// Import hooks and constants
import useLoyaltyData from './hooks/useLoyaltyData';
import { TIER_COLORS } from './constants/tierConfig';

/**
 * Loading state component for loyalty banner
 */
const LoadingState = () => (
  <div 
    className="text-center w-full py-2 flex flex-col justify-center items-center z-10"
    data-testid="loyalty-banner-loading"
  >
    <div className="animate-spin mb-2">
      <FaSpinner className="text-[#FF6B00]" size={28} />
    </div>
    <span className="text-xs text-gray-500">Loading VivaBucks rewards...</span>
  </div>
);

/**
 * Main loyalty banner component that displays user's tier and progress
 */
export default function LoyaltyBanner() {
  const { data: session, status } = useSession();

  // Use the custom hook to get loyalty data
  const { 
    userData,
    progressInfo,
    isLoading, 
    isMobile
  } = useLoyaltyData();

  // Don't render anything if user is not logged in
  if (status === "loading" || !session) return null;

  // Extract values with fallbacks
  const currentVivaBucks = userData?.vivaBucks ?? 0;
  const lifetimeVivaBucks = userData?.cumulativePoints ?? 0;
  const currentTier = userData?.currentTier || 'BRONZE';
  const multiplier = userData?.multiplier || 1;
  
  // Extract progress info with fallbacks
  const nextTierName = progressInfo?.nextTier ?? 'SILVER';
  const progressPercent = progressInfo?.progress ?? 0;
  const startPoints = progressInfo?.startPoints ?? 0;
  const endPoints = progressInfo?.endPoints ?? 0;
  
  // Get background accent color based on tier
  const bannerAccentColor = TIER_COLORS[currentTier]?.bg || TIER_COLORS.BRONZE.bg;

  return (
    <div 
      className="loyalty-banner w-full py-1 md:py-2 px-2 md:px-6 relative overflow-hidden border-b"
      style={{
        background: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        minHeight: isMobile ? '70px' : '90px',
        height: 'auto'
      }}
      data-testid="loyalty-banner"
    >
      {/* Decorative background elements */}
      <div 
        className={`absolute top-0 right-0 ${isMobile ? 'w-20 h-20' : 'w-32 h-32'} opacity-10 transform rotate-45 translate-x-12 -translate-y-12 z-0`}
        aria-hidden="true"
      >
        <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
      </div>
      <div 
        className={`absolute bottom-0 left-0 ${isMobile ? 'w-12 h-12' : 'w-24 h-24'} opacity-10 transform -rotate-45 -translate-x-8 translate-y-8 z-0`}
        aria-hidden="true"
      >
        <div className={`w-full h-full bg-gradient-to-br ${bannerAccentColor}`}></div>
      </div>

      {userData ? (
        <div 
          className={`flex ${isMobile ? 'flex-col' : 'flex-row flex-wrap'} justify-between z-10 ${isMobile ? 'items-start' : 'items-center'}`}
          data-testid="loyalty-banner-content"
        >
          {/* Points and tier display */}
          <TierPointsDisplay 
            currentTier={currentTier}
            points={currentVivaBucks}
            multiplier={multiplier}
            isMobile={isMobile}
          />
          
          {/* Progress bar */}
          {progressInfo && (
            <ProgressBar 
              progress={progressPercent}
              currentPoints={lifetimeVivaBucks}
              startPoints={startPoints}
              endPoints={endPoints}
            />
          )}
        </div>
      ) : (
        <LoadingState />
      )}
    </div>
  );
} 