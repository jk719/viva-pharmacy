'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import sseManager from '@/lib/sseManager';

export default function SSEProvider({ children }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!session?.user?.id || status !== 'authenticated') return;
    
    // CRITICAL FIX: Skip SSE connection during checkout success to avoid delays
    if (typeof window !== 'undefined') {
      const isCheckoutSuccess = window.location.pathname.includes('/checkout/success');
      if (isCheckoutSuccess) {
        console.log('🚫 Skipping SSE connection during checkout success flow to avoid delays');
        return;
      }
    }

    let cleanup;
    const initializeSSE = async () => {
      try {
        // Initialize SSE connection
        await sseManager.connect(session.user.id);

        // Add event listener for SSE messages
        cleanup = sseManager.addListener((data) => {
          if (!data) return;

          switch (data.type) {
            case 'CONNECTED':
              eventEmitter.emit(Events.CONNECTION_STATUS, {
                status: 'connected',
                userId: session.user.id
              });
              break;

            case 'PAYMENT_COMPLETED':
              eventEmitter.emit(Events.PAYMENT_COMPLETED, data);
              break;

            case 'LOYALTY_UPDATE':
            case 'POINTS_EARNED':
              // Only emit if points data is present
              if (data.points || data.vivaBucks) {
                eventEmitter.emit(data.type, data);
              }
              break;

            case 'ERROR':
              console.error('SSE Error:', data.error);
              eventEmitter.emit(Events.ERROR, data);
              break;

            case 'HEARTBEAT':
              // Handle heartbeat silently
              break;

            default:
              if (data.type) {
                eventEmitter.emit(data.type, data);
              }
          }
        });

      } catch (error) {
        console.error('Error initializing SSE:', error);
        eventEmitter.emit(Events.CONNECTION_STATUS, {
          status: 'failed',
          error: error.message,
          userId: session.user.id
        });
      }
    };

    initializeSSE();

    // Cleanup function
    return () => {
      if (cleanup) {
        cleanup();
      }
      sseManager.cleanup();
    };
  }, [session, status]);

  return children;
}
