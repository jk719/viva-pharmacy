'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { calculateProgressToNextTier } from '@/lib/loyalty/loyaltyCalculator';
import { TIER_CONFIG } from '../constants/tierConfig';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { trackLoyaltyPointsEarned, trackLoyaltyPointsRedeemed } from '@/lib/analytics/events';

export default function useLoyaltyData() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState(null);
  const [progressInfo, setProgressInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animatePoints, setAnimatePoints] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const previousPointsRef = useRef(null);
  const sseInitializedRef = useRef(false);
  const pollingIntervalRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch user data with cache control
  const fetchUserDataFresh = useCallback(async () => {
    if (!session?.user?.id) return null;
    
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const url = `/api/user/profile?nocache=${timestamp}&r=${random}`;
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      
      // Check if points have changed
      if (previousPointsRef.current && (
        previousPointsRef.current.vivaBucks !== data.vivaBucks ||
        previousPointsRef.current.cumulativePoints !== data.cumulativePoints
      )) {
        setAnimatePoints(true);
        setTimeout(() => setAnimatePoints(false), 3000);
      }

      // Update previous points reference
      previousPointsRef.current = {
        vivaBucks: data.vivaBucks,
        cumulativePoints: data.cumulativePoints
      };

      return data;
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Update user data and progress info
  const updateUserData = useCallback(async () => {
    const data = await fetchUserDataFresh();
    if (!data) return;
    
    // Track points changes
    if (previousPointsRef.current) {
      const pointsDiff = data.vivaBucks - previousPointsRef.current.vivaBucks;
      const cumulativeDiff = data.cumulativePoints - previousPointsRef.current.cumulativePoints;
      
      if (pointsDiff > 0) {
        trackLoyaltyPointsEarned(pointsDiff);
      } else if (pointsDiff < 0) {
        trackLoyaltyPointsRedeemed(Math.abs(pointsDiff));
      }
    }
    
    setUserData(data);
    setIsInitialized(true);
    
    if (data.cumulativePoints && typeof data.cumulativePoints === 'number') {
      try {
        const progress = calculateProgressToNextTier(data.cumulativePoints, TIER_CONFIG);
        setProgressInfo(progress);
      } catch (err) {
        console.error('Error calculating tier progress:', err);
      }
    }
  }, [fetchUserDataFresh]);

  // Initialize SSE connection
  useEffect(() => {
    if (sseInitializedRef.current || !session?.user?.id) return;

    const initSSE = async () => {
      try {
        const { default: sseManager } = await import('@/lib/sseManager');
        await sseManager.connect(session.user.id);
        sseInitializedRef.current = true;

        const removeListener = sseManager.addListener((event) => {
          if (event.type === 'LOYALTY_UPDATE' || event.type === 'POINTS_EARNED') {
            updateUserData();
          }
        });

        return removeListener;
      } catch (error) {
        console.error('Error initializing SSE:', error);
      }
    };

    initSSE();
  }, [session, updateUserData]);

  // Set up polling and event listeners
  useEffect(() => {
    if (!session?.user?.id) return;

    // Initial data fetch
    updateUserData();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(updateUserData, 60000);

    // Event listeners for mobile
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') updateUserData();
    };

    const handleStorageEvent = (e) => {
      if (e.key === 'viva_payment_completed') updateUserData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('viva:payment:completed', updateUserData);

    // Global refresh function with debounce
    window.refreshLoyaltyData = () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(updateUserData, 1000);
    };

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('viva:payment:completed', updateUserData);
      delete window.refreshLoyaltyData;
    };
  }, [session, updateUserData]);

  return {
    userData,
    progressInfo,
    isLoading,
    animatePoints,
    isMobile,
    isInitialized,
    refresh: updateUserData
  };
} 