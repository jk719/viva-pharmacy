'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModal, ModalType } from '@/context/ModalContext';

// This page serves as a "landing pad" for successful checkouts
// It doesn't directly display content but coordinates what modals to show
export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { showModal, activeModal } = useModal();
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    // Only run this logic once
    if (isProcessed) return;

    // Try to get the stored payment data from localStorage
    try {
      const storedData = localStorage.getItem('viva_payment_completed');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const { data, timestamp } = parsedData;
        
        // Only process if data is from the last 5 minutes (to prevent old data from triggering modals)
        const isRecent = Date.now() - timestamp < 5 * 60 * 1000;
        
        if (isRecent && data) {
          console.log('Found recent payment data on success page:', data);
          
          // Normalize data to ensure all field names are consistent
          const normalizedData = {
            ...data,
            // Normalize points fields
            loyaltyPointsEarned: data.loyaltyPointsEarned || data.pointsEarned || 0,
            pointsEarned: data.pointsEarned || data.loyaltyPointsEarned || 0,
            // Normalize amount fields
            total: data.total || data.amount || 0,
            amount: data.amount || data.total || 0
          };
          
          // Check for loyalty points using either field name
          const hasLoyaltyPoints = (normalizedData.loyaltyPointsEarned > 0);
          
          // If we have loyalty data, show the loyalty animation first
          if (hasLoyaltyPoints || data.tierUpgrade) {
            showModal(ModalType.LOYALTY_ANIMATION, normalizedData);
          }
          
          // Then queue the order success modal
          showModal(ModalType.ORDER_SUCCESS, normalizedData);
          
          // Clear the localStorage data to prevent duplicate processing
          localStorage.removeItem('viva_payment_completed');
        } else {
          console.log('Payment data found but too old or invalid:', parsedData);
          // Redirect to home after a short delay
          setTimeout(() => router.push('/'), 500);
        }
      } else {
        console.log('No payment data found in localStorage');
        // Redirect to home after a short delay
        setTimeout(() => router.push('/'), 500);
      }
    } catch (error) {
      console.error('Error processing checkout success:', error);
      // Redirect to home after a short delay
      setTimeout(() => router.push('/'), 500);
    }
    
    setIsProcessed(true);
  }, [router, showModal, isProcessed]);

  // This page doesn't render anything visible - it just coordinates modals
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-700">Processing your order...</h1>
        <p className="mt-2 text-gray-500">Please wait while we finalize your purchase.</p>
      </div>
    </div>
  );
} 