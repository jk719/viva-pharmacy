import LoyaltyBanner from '@/components/loyalty/LoyaltyBanner';
import { useEffect, useRef } from 'react';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { useModal, ModalType } from '@/context/ModalContext';

export default function LoyaltyAnimationModal() {
  // Use the modal context
  const { modalData, hideModal } = useModal();
  
  // Extract data from modalData, handling both possible field names
  const pointsEarned = modalData?.loyaltyPointsEarned || modalData?.pointsEarned || 0;
  const paymentIntent = modalData?.paymentIntent;
  const orderDetails = modalData?.orderDetails || modalData;
  const totalAmount = orderDetails?.total || orderDetails?.amount || 0;
  
  // Use ref to track if event already emitted
  const animationCompleteEmitted = useRef(false);

  // Log the data we received
  console.log('LoyaltyAnimationModal rendering with data:', {
    pointsEarned,
    orderId: orderDetails?.orderId || 'missing',
    hasPaymentIntent: !!paymentIntent,
    totalAmount
  });

  // Handle animation complete from LoyaltyBanner/ProgressBar
  const handleAnimationComplete = () => {
    console.log('LoyaltyAnimationModal: Animation complete');
    
    // Prevent duplicate events
    if (animationCompleteEmitted.current) {
      console.log('Animation complete already emitted, ignoring duplicate');
      return;
    }
    
    animationCompleteEmitted.current = true;
    
    // Emit the animation complete event for other components that might be listening
    const orderId = paymentIntent?.id || orderDetails?.orderId || '';
    eventEmitter.emit(Events.LOYALTY_ANIMATION_COMPLETE, {
      timestamp: Date.now(),
      orderId,
      source: 'animation_complete',
      completed: true
    });
    
    // Short delay to make animation visible before closing
    setTimeout(() => {
      hideModal(); // This will trigger the next modal in queue (likely OrderSuccessModal)
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center flex-col">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Payment Complete! 🎉</h2>
        <p className="mb-6">You earned {pointsEarned} VivaBucks!</p>
        <div className="w-full mb-8">
          <LoyaltyBanner 
            forceAnimation={true}
            onProgressBarAnimationComplete={handleAnimationComplete}
            key={`payment-loyalty-banner-${Date.now()}`}
          />
        </div>
        <p className="text-sm text-gray-500">Preparing your confirmation...</p>
      </div>
    </div>
  );
} 