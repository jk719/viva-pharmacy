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
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const previousPointsRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const updateTimeoutRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const initialFetchDoneRef = useRef(false);
  const updateQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

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
      return await response.json();
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Process update queue
  const processUpdateQueue = useCallback(async () => {
    if (isProcessingRef.current || updateQueueRef.current.length === 0) return;
    
    isProcessingRef.current = true;
    const update = updateQueueRef.current.shift();
    
    try {
      const data = await fetchUserDataFresh();
      if (!data) return;

      // Only update state if data is different
      const prev = previousPointsRef.current;
      const pointsIncreased = prev && data.vivaBucks > prev.vivaBucks;
      if (pointsIncreased) {
        setAnimatePoints(true);
        setTimeout(() => setAnimatePoints(false), 1500);
      }
      previousPointsRef.current = {
        vivaBucks: data.vivaBucks,
        cumulativePoints: data.cumulativePoints
      };

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
    } finally {
      isProcessingRef.current = false;
      // Process next update if any
      if (updateQueueRef.current.length > 0) {
        setTimeout(processUpdateQueue, 100);
      }
    }
  }, [fetchUserDataFresh]);

  // Queue update with debounce
  const queueUpdate = useCallback((force = false) => {
    const now = Date.now();
    if (!force && now - lastUpdateRef.current < 1000) {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => queueUpdate(true), 1000);
      return;
    }
    
    lastUpdateRef.current = now;
    updateQueueRef.current.push({ timestamp: now });
    processUpdateQueue();
  }, [processUpdateQueue]);

  // Handle connection status changes and SSE events
  useEffect(() => {
    if (!session?.user?.id) return;

    const handleConnectionStatus = (data) => {
      if (data.status === 'reconnecting') {
        setConnectionStatus('reconnecting');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          queueUpdate(true);
          setConnectionStatus('connected');
        }, data.delay || 1000);
      } else if (data.status === 'connected') {
        setConnectionStatus('connected');
      } else if (data.status === 'failed') {
        setConnectionStatus('disconnected');
      }
    };

    const handleLoyaltyUpdate = (data) => {
      console.log('[useLoyaltyData] LOYALTY_UPDATE event received', data);
      if (data.isComplete) {
        queueUpdate(true);
      }
    };

    // Initial data fetch only if not already done
    if (!initialFetchDoneRef.current) {
      queueUpdate(true);
      initialFetchDoneRef.current = true;
    }

    // Listen for loyalty updates
    eventEmitter.on(Events.LOYALTY_UPDATE, handleLoyaltyUpdate);
    eventEmitter.on(Events.CONNECTION_STATUS, handleConnectionStatus);

    // Set up visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && connectionStatus === 'disconnected') {
        queueUpdate(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      eventEmitter.off(Events.LOYALTY_UPDATE, handleLoyaltyUpdate);
      eventEmitter.off(Events.CONNECTION_STATUS, handleConnectionStatus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session, queueUpdate, connectionStatus]);

  return {
    userData,
    progressInfo,
    isLoading,
    animatePoints,
    isMobile,
    isInitialized,
    connectionStatus,
    refresh: () => queueUpdate(true)
  };
} 