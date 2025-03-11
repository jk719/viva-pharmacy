'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRewardsStore } from '@/lib/stores/rewardsStore';
import eventEmitter, { Events } from '@/lib/eventEmitter';

// Dynamically import sseManager to avoid SSR issues
let sseManager;

export default function SSEProvider({ children }) {
  const { data: session, status } = useSession();
  const { clearActiveReward } = useRewardsStore();
  const [isClient, setIsClient] = useState(false);
  const mountedRef = useRef(false);
  const eventTimeoutsRef = useRef(new Map());
  const connectionRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const initializingRef = useRef(false);

  // Initialize sseManager on client side only
  useEffect(() => {
    const initSSE = async () => {
      if (!sseManager) {
        sseManager = (await import('@/lib/sseManager')).default;
      }
      setIsClient(true);
    };
    initSSE();
  }, []);

  const clearEventTimeout = useCallback((key) => {
    if (eventTimeoutsRef.current.has(key)) {
      clearTimeout(eventTimeoutsRef.current.get(key));
      eventTimeoutsRef.current.delete(key);
    }
  }, []);

  const handleSSEMessage = useCallback((data) => {
    if (!mountedRef.current || !isClient) return;
    
    const timeoutKey = `${data.type}_${data.userId}`;
    clearEventTimeout(timeoutKey);
    
    switch (data.type) {
      case 'PAYMENT_COMPLETED':
        // Emit payment completed first
        eventEmitter.emit(Events.PAYMENT_COMPLETED, {
          ...data,
          animate: true,
          timestamp: new Date().toISOString()
        });
        
        // Then schedule points update after a delay
        const timeout = setTimeout(() => {
          eventEmitter.emit(Events.POINTS_UPDATED, {
            ...data,
            animate: true,
            timestamp: new Date().toISOString()
          });
        }, 1000); // Wait 1 second before points update
        
        eventTimeoutsRef.current.set(timeoutKey, timeout);
        break;
        
      case 'POINTS_UPDATED':
        // Only emit points update if it's not from a payment
        if (!data.fromPayment) {
          eventEmitter.emit(Events.POINTS_UPDATED, {
            ...data,
            animate: true,
            timestamp: new Date().toISOString()
          });
        }
        break;
        
      case 'REWARD_REDEEMED':
      case 'REWARD_RESTORED':
        eventEmitter.emit(data.type, data);
        break;
        
      case Events.PING:
      case Events.HEARTBEAT:
        // Handle silently
        break;
        
      default:
        console.log('Unhandled event type:', data.type);
    }
  }, [clearEventTimeout, isClient]);

  const initializeSSE = useCallback(async () => {
    if (!mountedRef.current || initializingRef.current || 
        !isClient || status !== 'authenticated' || !session?.user?.id || !sseManager) {
      return;
    }

    try {
      initializingRef.current = true;
      console.log('🔄 Initializing SSE connection...');

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      const connection = await sseManager.connect(session.user.id);
      
      if (mountedRef.current) {
        connectionRef.current = connection;
        const cleanup = sseManager.addListener(handleSSEMessage);
        return cleanup;
      }
    } catch (error) {
      console.error('SSE initialization error:', error);
      if (error?.status === 429 && mountedRef.current) {
        const retryAfter = parseInt(error.headers?.get('Retry-After') || '5');
        retryTimeoutRef.current = setTimeout(() => {
          initializingRef.current = false;
          initializeSSE();
        }, retryAfter * 1000);
      }
    } finally {
      initializingRef.current = false;
    }
  }, [session?.user?.id, status, handleSSEMessage, isClient]);

  useEffect(() => {
    mountedRef.current = true;
    let cleanup;

    if (isClient && status === 'authenticated' && session?.user?.id && sseManager) {
      const connectionTimeout = setTimeout(async () => {
        cleanup = await initializeSSE();
      }, 2000);

      return () => {
        clearTimeout(connectionTimeout);
        if (cleanup) cleanup();
      };
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [status, session?.user?.id, initializeSSE, isClient]);

  // Handle cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearTimeout(retryTimeoutRef.current);
      if (connectionRef.current && sseManager) {
        sseManager.cleanup();
        connectionRef.current = null;
      }
      eventTimeoutsRef.current.forEach(clearTimeout);
      eventTimeoutsRef.current.clear();
      initializingRef.current = false;
    };
  }, []);

  // Handle sign-out cleanup
  useEffect(() => {
    if (!session && sseManager) {
      clearActiveReward();
      sseManager.cleanup();
      eventTimeoutsRef.current.forEach(clearTimeout);
      eventTimeoutsRef.current.clear();
    }
  }, [session, clearActiveReward]);

  if (!isClient) {
    return children;
  }

  return children;
}
