"use client";

import { FaCheckCircle, FaBox, FaEnvelope, FaGift } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderSuccessModal({ orderDetails }) {
  const router = useRouter();
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    // Delay showing rewards section to allow loyalty bar to animate first
    const rewardsTimeout = setTimeout(() => {
      setShowRewards(true);
    }, 1000);

    return () => clearTimeout(rewardsTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center animate-scaleIn">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounceIn">
          <FaCheckCircle className="w-12 h-12 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Order Confirmed! 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for shopping with us!
        </p>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <FaBox className="text-primary text-xl" />
              <h3 className="font-semibold text-gray-800">Order Details</h3>
            </div>
            <p className="text-sm text-gray-600">
              Order #{orderDetails?.orderId}
            </p>
            <p className="text-sm text-gray-600">
              {orderDetails?.deliveryMethod === 'delivery' 
                ? `Delivery on ${new Date(orderDetails?.selectedTime).toLocaleDateString()}`
                : `Pickup on ${new Date(orderDetails?.selectedTime).toLocaleDateString()}`
              }
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <FaEnvelope className="text-green-600 text-xl" />
              <h3 className="font-semibold text-gray-800">Confirmation Email</h3>
            </div>
            <p className="text-sm text-gray-600">
              A confirmation email has been sent with your order details
            </p>
          </div>

          {orderDetails?.pointsEarned && showRewards && (
            <div className="bg-yellow-50 rounded-lg p-4 animate-slideUp">
              <div className="flex items-center gap-3 mb-2">
                <FaGift className="text-yellow-600 text-xl" />
                <h3 className="font-semibold text-gray-800">Rewards Earned</h3>
              </div>
              <p className="text-sm text-gray-600">
                You earned {orderDetails.pointsEarned} VivaBucks! 🌟
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/profile/orders')}
            className="flex-1 py-3 px-6 bg-gray-100 text-gray-800 rounded-lg font-semibold
                     hover:bg-gray-200 transition-colors hover:scale-102 active:scale-98"
          >
            View Orders
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 px-6 bg-primary text-white rounded-lg font-semibold
                     hover:bg-primary/90 transition-colors hover:scale-102 active:scale-98"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
} 