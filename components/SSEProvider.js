'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import sseManager from '@/lib/sseManager';
import { useRewardsStore } from '@/lib/stores/rewardsStore';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export default function SSEProvider({ children }) {
  const { data: session, status } = useSession();
  const { clearActiveReward } = useRewardsStore();
  const mountedRef = useRef(false);
  const eventTimeoutsRef = useRef(new Map());
  const connectionRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const initializingRef = useRef(false);

  const clearEventTimeout = useCallback((key) => {
    if (eventTimeoutsRef.current.has(key)) {
      clearTimeout(eventTimeoutsRef.current.get(key));
      eventTimeoutsRef.current.delete(key);
    }
  }, []);

  const handleSSEMessage = useCallback((data) => {
    if (!mountedRef.current) return;
    
    // Don't log heartbeat, ping, or connected messages
    if (!['HEARTBEAT', 'PING', 'CONNECTED'].includes(data.type)) {
      console.log('📨 SSE message received:', data);
    }
    
    const timeoutKey = `${data.type}_${data.userId}`;
    clearEventTimeout(timeoutKey);
    
    switch (data.type) {
      case 'CONNECTED':
        // Handle connection confirmation silently
        break;
        
      case 'POINTS_UPDATED':
        const timeout = setTimeout(() => {
          console.log('📊 Emitting points update from SSE:', data);
          eventEmitter.emit(Events.POINTS_UPDATED, {
            ...data,
            animate: true,
            timestamp: new Date().toISOString()
          });
        }, data.afterPayment ? 800 : 300);
        eventTimeoutsRef.current.set(timeoutKey, timeout);
        break;
        
      case 'PAYMENT_COMPLETED':
        eventEmitter.emit(Events.PAYMENT_COMPLETED, {
          ...data,
          animate: true,
          timestamp: new Date().toISOString()
        });
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
  }, [clearEventTimeout]);

  const initializeSSE = useCallback(async () => {
    if (!mountedRef.current || initializingRef.current || 
        status !== 'authenticated' || !session?.user?.id) {
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
  }, [session?.user?.id, status, handleSSEMessage]);

  useEffect(() => {
    mountedRef.current = true;
    let connectionTimeout;
    let cleanup;

    if (status === 'authenticated' && session?.user?.id) {
      connectionTimeout = setTimeout(async () => {
        cleanup = await initializeSSE();
      }, 2000);
    }

    return () => {
      mountedRef.current = false;
      clearTimeout(connectionTimeout);
      clearTimeout(retryTimeoutRef.current);
      if (cleanup) cleanup();
      if (connectionRef.current) {
        sseManager.cleanup();
        connectionRef.current = null;
      }
      eventTimeoutsRef.current.forEach(clearTimeout);
      eventTimeoutsRef.current.clear();
      initializingRef.current = false;
    };
  }, [status, session?.user?.id, initializeSSE]);

  // Handle sign-out cleanup
  useEffect(() => {
    if (!session) {
      clearActiveReward();
      sseManager.cleanup();
      // Clear all timeouts
      eventTimeoutsRef.current.forEach(clearTimeout);
      eventTimeoutsRef.current.clear();
    }
  }, [session, clearActiveReward]);

  return children;
}
