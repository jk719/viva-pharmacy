import LoyaltyBanner from '@/components/loyalty/LoyaltyBanner';
import { useEffect, useRef } from 'react';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export default function LoyaltyAnimationModal({
  pointsEarned,
  paymentIntent,
  orderDetails,
  onProgressBarAnimationComplete
}) {
  // Use ref to track if redirect already triggered
  const redirectTriggered = useRef(false);

  // Set up guaranteed fallback timer
  useEffect(() => {
    const orderId = paymentIntent?.id || orderDetails?.orderId || '';
    if (!orderId) return;
    
    // Guaranteed fallback redirect after 5 seconds
    const timeout = setTimeout(() => {
      if (!redirectTriggered.current) {
        console.log('🚨 Animation fallback redirect triggered after timeout');
        redirectTriggered.current = true;
        
        // Include animate=false to prevent duplicate animations
        window.location.href = `/checkout/success?orderId=${orderId}&animate=false&redirect=timeout&ts=${Date.now()}`;
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [paymentIntent, orderDetails]);

  // Centralized redirect function to avoid race conditions
  const redirectToSuccessPage = (orderId, source) => {
    if (redirectTriggered.current) {
      console.log('⚠️ Redirect already triggered, ignoring duplicate:', source);
      return;
    }
    
    console.log(`🔄 Redirecting to success page from ${source}`);
    redirectTriggered.current = true;
    
    // Emit event before redirecting to notify any listeners
    eventEmitter.emit(Events.LOYALTY_ANIMATION_COMPLETE, {
      timestamp: Date.now(),
      orderId,
      source,
      completed: true
    });
    
    // Do the actual redirect with a small delay to allow event processing
    setTimeout(() => {
      window.location.href = `/checkout/success?orderId=${orderId}&animate=false&source=${source}&ts=${Date.now()}`;
    }, 100);
  };
  
  // Handle animation complete from LoyaltyBanner/ProgressBar
  const handleAnimationComplete = () => {
    const orderId = paymentIntent?.id || orderDetails?.orderId || '';
    if (!orderId) return;
    
    // Call the callback if provided (for parent component coordination)
    if (typeof onProgressBarAnimationComplete === 'function') {
      onProgressBarAnimationComplete();
    }
    
    // Wait slightly longer to ensure animation is visually complete
    setTimeout(() => {
      redirectToSuccessPage(orderId, 'animation_complete');
    }, 800);
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