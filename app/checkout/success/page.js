'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useModal, ModalType } from '@/context/ModalContext';
import { paymentStorage } from '@/utils/paymentStorage';

// This page serves as a "landing pad" for successful checkouts
// It doesn't directly display content but coordinates what modals to show
export default function CheckoutSuccessPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showModal } = useModal();
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retrieve payment data using centralized utility
    const storedData = paymentStorage.retrieve();
    
    if (storedData) {
      console.log('Retrieved payment data:', storedData);
      setPaymentData(storedData);
      
      // Show success modals
      const hasLoyaltyPoints = (storedData.loyaltyPointsEarned > 0 || storedData.pointsEarned > 0);
      
      if (hasLoyaltyPoints || storedData.tierUpgrade) {
        showModal(ModalType.LOYALTY_ANIMATION, storedData);
      }
      
      showModal(ModalType.ORDER_SUCCESS, storedData);
    } else {
      console.log('No payment data found, redirecting to home');
      // If no payment data, redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
    
    setIsLoading(false);
  }, [showModal, router]);

  useEffect(() => {
    // Clean up payment data after component mounts
    // This ensures the success page can only be accessed once per payment
    const cleanup = () => {
      if (paymentData) {
        paymentStorage.clear();
      }
    };

    // Clean up when component unmounts or after 30 seconds
    const timer = setTimeout(cleanup, 30000);
    
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [paymentData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your order details.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your purchase.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{paymentData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">${(paymentData.total / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VivaBucks Earned:</span>
                <span className="font-medium text-primary">{paymentData.loyaltyPointsEarned || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Method:</span>
                <span className="font-medium capitalize">{paymentData.deliveryMethod}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/profile/orders')}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              View Order History
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 