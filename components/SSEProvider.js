'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export default function SSEProvider({ children }) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current && eventSourceRef.current instanceof EventSource) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleConnectionError = useCallback(() => {
    if (eventSourceRef.current && eventSourceRef.current instanceof EventSource) {
      eventSourceRef.current.close();
    }
    eventSourceRef.current = null;
  }, []);

  useEffect(() => {
    if (!mounted || status !== "authenticated" || !session?.user?.id) {
      return;
    }

    const initSSE = async () => {
      try {
        // Only import and initialize on client side
        const { default: sseManager } = await import('@/lib/sseManager');
        const newEventSource = sseManager.connect(session.user.id);

        if (newEventSource instanceof EventSource) {
          newEventSource.onopen = () => {
            eventEmitter.emit(Events.CONNECTION_STATUS, {
              userId: session.user.id,
              status: 'connected'
            });
          };

          newEventSource.onerror = handleConnectionError;
          eventSourceRef.current = newEventSource;
        }
      } catch (error) {
        console.error('SSE initialization error:', error);
        handleConnectionError();
      }
    };

    initSSE();

    // Cleanup function
    return () => {
      if (eventSourceRef.current && eventSourceRef.current instanceof EventSource) {
        eventSourceRef.current.close();
      }
    };
  }, [session?.user?.id, mounted, status, handleConnectionError]);

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
