'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { calculateProgressToNextTier } from '@/lib/loyalty/loyaltyCalculator';
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig';
import eventEmitter, { Events } from '@/lib/eventEmitter';

/**
 * Custom hook to fetch and manage user loyalty data
 */
export default function useLoyaltyData() {
  const { data: session, status: sessionStatus } = useSession();
  const [userData, setUserData] = useState(null);
  const [progressInfo, setProgressInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Refs for tracking state across renders
  const lastUpdateRef = useRef(0);
  const updateTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const initialFetchDoneRef = useRef(false);
  const updateQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

  // Immediately set loading to false if user is not authenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      setIsLoading(false);
      setIsInitialized(true);
    } else if (sessionStatus === 'loading') {
      setIsLoading(true);
    }
  }, [sessionStatus]);

  // Fetch user data with cache control - CHANGED to use /api/user/profile endpoint
  const fetchUserDataFresh = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return null;
    }
    
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      // Changed URL from loyalty-status to profile
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

      // Ensure data has the correct structure - normalize field names if needed
      const normalizedData = {
        ...data,
        // Ensure these properties exist in the normalized form
        vivaBucks: data.vivaBucks || 0,
        cumulativePoints: data.cumulativePoints || 0,
        currentTier: data.currentTier || 'BRONZE',
        pointsMultiplier: data.pointsMultiplier || 1,
      };

      // Update state with fetched data
      setUserData(normalizedData);
      setIsInitialized(true);
      
      // Calculate tier progress if we have cumulative points
      if (normalizedData.cumulativePoints && typeof normalizedData.cumulativePoints === 'number') {
        try {
          const progress = calculateProgressToNextTier(normalizedData.cumulativePoints, TIER_CONFIG);
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

  // Handle connection status changes and visibility changes
  useEffect(() => {
    if (!session?.user?.id || sessionStatus !== 'authenticated') return;

    // Handle connection status updates
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

    // Initial data fetch only if not already done
    if (!initialFetchDoneRef.current) {
      queueUpdate(true);
      initialFetchDoneRef.current = true;
    }

    // Listen for connection status changes
    eventEmitter.on(Events.CONNECTION_STATUS, handleConnectionStatus);

    // Refresh data when tab becomes visible and was disconnected
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && connectionStatus === 'disconnected') {
        queueUpdate(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up event listeners and timeouts
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      eventEmitter.off(Events.CONNECTION_STATUS, handleConnectionStatus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session, queueUpdate, connectionStatus, sessionStatus]);

  // Return values and functions needed by components
  return {
    userData,
    progressInfo,
    isLoading,
    isInitialized,
    connectionStatus,
    refresh: () => queueUpdate(true)
  };
} 