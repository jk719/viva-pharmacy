import LoyaltyProgressBar from '@/components/loyalty/LoyaltyProgressBar';
import { useEffect, useRef, useState } from 'react';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { useModal, ModalType } from '@/context/ModalContext';
import { FaCheckCircle, FaCoins } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useImprovedLoyaltyStore from '@/lib/loyalty/improvedLoyaltyStore';

export default function LoyaltyAnimationModal() {
  // Use the modal context
  const { modalData, hideModal } = useModal();
  
  // Get current loyalty data from improved store
  const { userData, progressInfo } = useImprovedLoyaltyStore();
  
  // State
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Safety check - don't show on giveaway or other non-checkout pages
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.includes('/giveaway')) {
      // Close modal immediately if we're on a non-checkout page
      console.log('LoyaltyAnimationModal: Not rendering on giveaway page');
      setTimeout(hideModal, 0);
      return null; // Don't render anything
    }
  }
  
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
    totalAmount,
    hasUserData: !!userData,
    hasProgressInfo: !!progressInfo
  });

  // Handle animation complete from progress bar
  const handleAnimationComplete = () => {
    console.log('LoyaltyAnimationModal: Animation complete');
    
    // Prevent duplicate events
    if (animationCompleteEmitted.current) {
      console.log('Animation complete already emitted, ignoring duplicate');
      return;
    }
    
    animationCompleteEmitted.current = true;
    setAnimationComplete(true);
    
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
    }, 2000);
  };

  // Prepare progress bar data - use improved store's data structure
  const currentPoints = userData?.totalVivaBucksEarned || userData?.cumulativeVivaBucks || 0;
  const startPoints = progressInfo?.startPoints || 0;
  const endPoints = progressInfo?.endPoints || 100;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center"
        >
          <FaCheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>
        
        {/* Header */}
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-2 text-gray-800"
        >
          Payment Complete! 🎉
        </motion.h2>
        
        {/* Points earned message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaCoins className="text-amber-500 text-xl" />
              <span className="text-lg font-semibold text-gray-700">
                You earned {pointsEarned} VivaBucks!
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Watch your progress grow towards the next tier
            </p>
          </div>
        </motion.div>
        
        {/* Progress Bar */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <LoyaltyProgressBar
            currentPoints={currentPoints}
            earnedPoints={pointsEarned}
            startPoints={startPoints}
            endPoints={endPoints}
            animate={true}
            forceAnimation={true}
            onAnimationComplete={handleAnimationComplete}
            label="Progress to Next Tier"
            variant="modal"
            className="bg-gray-50 rounded-xl border border-gray-200"
          />
        </motion.div>
        
        {/* Footer message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: animationComplete ? 1 : 0.6 }}
          transition={{ delay: 1 }}
          className="text-sm text-gray-500"
        >
          {animationComplete ? 
            "🎊 Preparing your order confirmation..." : 
            "✨ Calculating your rewards..."
          }
        </motion.div>
      </motion.div>
    </div>
  );
} 