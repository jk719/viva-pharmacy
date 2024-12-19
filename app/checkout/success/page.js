'use client';

import { Suspense, useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import confetti from 'canvas-confetti';

function SuccessContent() {
  const { clearCart, items = [] } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  const [countdown, setCountdown] = useState(5);

  // Trigger confetti effect
  useEffect(() => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#003366', '#0066cc', '#66b3ff']
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#003366', '#0066cc', '#66b3ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);

  // Handle points update and auto-redirect
  useEffect(() => {
    const updatePoints = async () => {
      if (session?.user?.id) {
        try {
          const amount = items.reduce((sum, item) => 
            sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
          const points = Math.floor(amount);

          await fetch(`/api/user/vivabucks/${session.user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points, source: 'purchase' })
          });

          eventEmitter.emit(Events.POINTS_UPDATED);
        } catch (error) {
          console.error('Error updating points:', error);
        }
      }
    };

    // Update points immediately
    updatePoints();
    clearCart();

    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[80vh] flex items-center justify-center px-4"
    >
      <div className="max-w-2xl w-full">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-primary p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center"
            >
              <svg 
                className="w-12 h-12 text-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-white/90">Your order has been successfully placed.</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-6 text-center">
              {session?.user?.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-blue-50 rounded-lg p-4"
                >
                  <p className="text-primary">
                    VivaBucks have been added to your account! 🎉
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <p className="text-gray-600">
                  We've sent a confirmation email with your order details.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to home in {countdown} seconds...
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={() => router.push('/account/orders')}
                  className="px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary/5 
                           transition-colors duration-200"
                >
                  View Orders
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 
                           transition-colors duration-200"
                >
                  Continue Shopping
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
