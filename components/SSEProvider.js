'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import sseManager from '@/lib/sseManager';
import { useRewardsStore } from '@/lib/stores/rewardsStore';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export default function SSEProvider({ children }) {
  const { data: session } = useSession();
  const { clearActiveReward } = useRewardsStore();
  const mountedRef = useRef(false);

  const handleSSEMessage = useCallback((data) => {
    if (!mountedRef.current) return;
    
    console.log('📨 SSE message received:', data);
    switch (data.type) {
      case 'POINTS_UPDATED':
        eventEmitter.emit(Events.POINTS_UPDATED, data);
        break;
      case 'REWARD_RESTORED':
        eventEmitter.emit(Events.REWARD_RESTORED, data);
        break;
      case 'REWARD_REDEEMED':
        eventEmitter.emit(Events.REWARD_REDEEMED, data);
        break;
      case 'PAYMENT_COMPLETED':
        eventEmitter.emit(Events.POINTS_UPDATED, data);
        break;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let cleanup;
    
    const initializeSSE = async () => {
      if (!session?.user?.id) return;

      try {
        await sseManager.connect(session.user.id);
        if (mountedRef.current) {
          cleanup = sseManager.addListener(handleSSEMessage);
        }
      } catch (error) {
        console.error('Failed to initialize SSE:', error);
      }
    };

    initializeSSE();

    return () => {
      mountedRef.current = false;
      cleanup?.();
      sseManager.cleanup();
    };
  }, [session?.user?.id, handleSSEMessage]);

  // Handle sign-out cleanup
  useEffect(() => {
    if (!session) {
      clearActiveReward();
      sseManager.cleanup();
    }
  }, [session, clearActiveReward]);

  return children;
}
