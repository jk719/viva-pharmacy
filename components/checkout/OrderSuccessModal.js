"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaBox } from 'react-icons/fa';
import { useModal, ModalType } from '@/context/ModalContext';

export default function OrderSuccessModal() {
  // Get modal context
  const { modalData, hideModal } = useModal();
  const orderDetails = modalData || {};
  
  // Extract points (handle both field name possibilities)
  const pointsEarned = orderDetails?.pointsEarned || orderDetails?.loyaltyPointsEarned || 0;
  
  // Extract total amount (handle both field name possibilities)
  const totalAmount = orderDetails?.total || orderDetails?.amount || 0;
  
  // Log for debugging
  console.log('OrderSuccessModal RENDERING with data:', { 
    hasOrderDetails: !!orderDetails, 
    orderId: orderDetails?.orderId || 'MISSING',
    itemCount: orderDetails?.items?.length || 0,
    pointsEarned,
    totalAmount
  });
  
  const router = useRouter();
  
  useEffect(() => {
    console.log('OrderSuccessModal - useEffect mounted with order details:', orderDetails);
    // Block scrolling when modal opens
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup function
    return () => {
      console.log('OrderSuccessModal - useEffect cleanup');
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [orderDetails]);

  const handleClose = () => {
    console.log('OrderSuccessModal - handleClose clicked');
    hideModal();
  };

  const handleViewOrders = () => {
    console.log('OrderSuccessModal - handleViewOrders clicked');
    hideModal();
    router.push('/profile/orders');
  };
  
  const handleContinueShopping = () => {
    console.log('OrderSuccessModal - handleContinueShopping clicked');
    hideModal();
    router.push('/');
  };

  // Handle missing order details gracefully
  if (!orderDetails || !orderDetails.orderId) {
    console.warn('OrderSuccessModal - Warning: Missing order details');
  }

  return (
    <div 
      className="order-success-modal fixed inset-0 z-[9999999] flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div 
        className="relative bg-white rounded-lg p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <FaCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
          <p className="mb-2">Your order #{orderDetails?.orderId || 'Pending'} has been placed.</p>
          
          {/* Order summary */}
          <div className="bg-gray-50 rounded p-3 mb-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <FaBox className="text-primary" />
              <span className="font-medium">Order Summary</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Total: ${totalAmount.toFixed(2)}</p>
              <p>Method: {orderDetails?.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</p>
              {pointsEarned > 0 && (
                <p className="text-green-600 font-medium">Rewards: {pointsEarned} points earned!</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleViewOrders}
              className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            >
              View Orders
            </button>
            <button 
              onClick={handleContinueShopping}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Continue Shopping
            </button>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
} 