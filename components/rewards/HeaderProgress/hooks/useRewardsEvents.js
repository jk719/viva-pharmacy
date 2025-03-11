import { useEffect, useRef } from 'react';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export const useRewardsEvents = (handleAnimation) => {
  const mountedRef = useRef(true);
  const lastProcessedPaymentRef = useRef(null);

  useEffect(() => {
    const handlePaymentCompleted = (data) => {
      if (!mountedRef.current) return;
      
      if (lastProcessedPaymentRef.current === data.paymentIntentId) {
        return;
      }
      
      lastProcessedPaymentRef.current = data.paymentIntentId;
      handleAnimation(data.amount);
    };

    eventEmitter.on(Events.PAYMENT_COMPLETED, handlePaymentCompleted);
    
    return () => {
      mountedRef.current = false;
      eventEmitter.off(Events.PAYMENT_COMPLETED, handlePaymentCompleted);
    };
  }, [handleAnimation]);

  return { mountedRef };
}; 