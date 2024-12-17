'use client';

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";

function SuccessContent() {
  const { clearCart, items = [] } = useCart();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const updatePoints = async () => {
      if (session?.user?.id) {
        try {
          // Calculate total amount from items
          const amount = items.reduce((sum, item) => 
            sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
          
          // Calculate points based on purchase amount
          const points = Math.floor(amount);

          await fetch(`/api/user/vivabucks/${session.user.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              points,
              source: 'purchase'
            })
          });

          eventEmitter.emit(Events.POINTS_UPDATED);
        } catch (error) {
          console.error('Error updating points:', error);
        }
      }
    };

    const timer = setTimeout(async () => {
      await updatePoints();
      clearCart();
    }, 100);

    return () => clearTimeout(timer);
  }, [session]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.svg 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="w-16 h-16 text-green-500 mx-auto mb-4" 
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
          </motion.svg>
          <h1 className="text-2xl font-bold mb-4 text-primary">Payment Successful!</h1>
          <p className="mb-6 text-gray-600">Thank you for your purchase.</p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/')}
          className="bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 
                   transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Return to Home
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
