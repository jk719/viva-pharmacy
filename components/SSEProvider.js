'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import eventEmitter, { Events } from '@/lib/eventEmitter';

// Dynamically import sseManager to avoid SSR issues
const sseManager = typeof window !== 'undefined' ? require('@/lib/sseManager').default : null;

export default function SSEProvider({ children }) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const eventSourceRef = useRef(null);

  const handleConnectionError = useCallback(() => {
    setIsConnected(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const initializeSSE = useCallback(() => {
    if (!session?.user?.id || !sseManager) return;

    try {
      const newEventSource = sseManager.connect(session.user.id);
      
      newEventSource.onopen = () => {
        setIsConnected(true);
        eventEmitter.emit(Events.CONNECTION_STATUS, {
          userId: session.user.id,
          status: 'connected'
        });
      };

      newEventSource.onerror = handleConnectionError;

      eventSourceRef.current = newEventSource;
    } catch (error) {
      console.error('SSE initialization error:', error);
      handleConnectionError();
    }
  }, [session?.user?.id, handleConnectionError]);

  useEffect(() => {
    initializeSSE();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [initializeSSE]);

  // Handle payment events
  useEffect(() => {
    const handlePaymentCompleted = (data) => {
      console.log('💰 Payment completed:', data);
    };

    eventEmitter.on(Events.PAYMENT_COMPLETED, handlePaymentCompleted);

    return () => {
      eventEmitter.off(Events.PAYMENT_COMPLETED, handlePaymentCompleted);
    };
  }, []);

  return children;
}
