"use client";

import { motion } from 'framer-motion';
import { FaCheckCircle, FaTruck, FaEnvelope } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function PrescriptionDeliverySuccess({ paymentDetails }) {
  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const confettiAnimation = () => {
      const timeLeft = animationEnd - Date.now();
      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        particleCount,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0066cc', '#4CAF50', '#FFC107'],
      });

      if (timeLeft > 0) {
        requestAnimationFrame(confettiAnimation);
      }
    };

    confettiAnimation();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <FaCheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Your prescription delivery has been confirmed.
        </p>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <FaTruck className="text-primary text-xl" />
              <h3 className="font-semibold text-gray-800">Delivery Details</h3>
            </div>
            <p className="text-sm text-gray-600">
              Estimated delivery: {paymentDetails.estimatedDelivery}
            </p>
            <p className="text-sm text-gray-600">
              Tracking updates will be sent to your email
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <FaEnvelope className="text-green-600 text-xl" />
              <h3 className="font-semibold text-gray-800">Confirmation Email</h3>
            </div>
            <p className="text-sm text-gray-600">
              A confirmation email has been sent with your delivery details
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/'}
          className="w-full py-3 px-6 bg-primary text-white rounded-lg font-semibold
                   hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </motion.button>
      </motion.div>
    </motion.div>
  );
} 