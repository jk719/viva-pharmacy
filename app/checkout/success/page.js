"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderSuccessModal from '@/components/checkout/OrderSuccessModal';
import { eventEmitter, Events } from '@/lib/eventEmitter';

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loyaltyUpdated, setLoyaltyUpdated] = useState(false);
  const [progressBarComplete, setProgressBarComplete] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const points = searchParams.get('points');
    const selectedTime = searchParams.get('selectedTime');
    const deliveryMethod = searchParams.get('deliveryMethod');

    if (!orderId) {
      router.replace('/');
      return;
    }

    setOrderDetails({
      orderId,
      pointsEarned: points,
      selectedTime,
      deliveryMethod
    });

    // Listen for loyalty update completion
    const handleLoyaltyUpdate = (data) => {
      if (data.isComplete) {
        setLoyaltyUpdated(true);
      }
    };

    // Listen for progress bar animation completion
    const handleProgressBarComplete = () => {
      setProgressBarComplete(true);
    };

    eventEmitter.on(Events.LOYALTY_UPDATE, handleLoyaltyUpdate);
    eventEmitter.on(Events.PROGRESS_BAR_ANIMATION_COMPLETE, handleProgressBarComplete);

    // Fallback timeout for safety
    const timeoutId = setTimeout(() => {
      setLoyaltyUpdated(true);
      setProgressBarComplete(true);
    }, 3500); // Extended timeout to account for animations

    return () => {
      eventEmitter.off(Events.LOYALTY_UPDATE, handleLoyaltyUpdate);
      eventEmitter.off(Events.PROGRESS_BAR_ANIMATION_COMPLETE, handleProgressBarComplete);
      clearTimeout(timeoutId);
    };
  }, [searchParams, router]);

  // Only show modal after both loyalty is updated and progress bar animation is complete
  useEffect(() => {
    if (loyaltyUpdated && progressBarComplete && orderDetails) {
      // Add a small delay before showing modal to ensure smooth transition
      const modalTimer = setTimeout(() => {
        setShowModal(true);
      }, 200);

      return () => clearTimeout(modalTimer);
    }
  }, [loyaltyUpdated, progressBarComplete, orderDetails]);

  if (!showModal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <OrderSuccessModal orderDetails={orderDetails} />;
}
