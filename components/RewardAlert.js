'use client';

import { useRewardsStore } from '@/lib/stores/rewardsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function RewardAlert() {
  const { data: session, status } = useSession();
  const { activeReward, clearActiveReward, initialized } = useRewardsStore();
  const [mounted, setMounted] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Listen for points reset event
    const handlePointsReset = () => {
      clearActiveReward();
    };
    
    eventEmitter.on(Events.POINTS_RESET, handlePointsReset);
    
    return () => {
      setMounted(false);
      eventEmitter.off(Events.POINTS_RESET, handlePointsReset);
    };
  }, [clearActiveReward]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      clearActiveReward();
    }
  }, [status, clearActiveReward]);

  const handleClearReward = async () => {
    if (!session?.user?.id || !activeReward || isRestoring) return;

    try {
      setIsRestoring(true);
      console.log('Starting reward restoration for amount:', activeReward);

      // First, check if the user has sufficient balance
      const balanceResponse = await fetch(`/api/user/vivabucks/${session.user.id}`);
      const balanceData = await balanceResponse.json();
      
      if (!balanceResponse.ok || balanceData.vivaBucks < activeReward) {
        toast.error('Insufficient reward balance');
        return;
      }

      const response = await fetch(`/api/user/vivabucks/${session.user.id}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: activeReward })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('Restoration successful:', data);
        
        // Clear the reward first
        clearActiveReward();
        
        // Emit events to update the dashboard
        eventEmitter.emit(Events.POINTS_UPDATED, data);
        eventEmitter.emit(Events.REWARD_RESTORED, data);
        
        // Show success message
        toast.success('Reward restored successfully');
      } else {
        console.error('Restoration failed:', data.error);
        toast.error(data.error || 'Failed to restore reward');
      }
    } catch (error) {
      console.error('Error during restoration:', error);
      toast.error('Error restoring reward. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Only show if we have an active reward amount greater than 0
  if (!mounted || !initialized || !activeReward || activeReward <= 0 || status !== 'authenticated') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-0 left-0 right-0 w-full bg-emerald-500 shadow-lg z-50"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-white gap-3">
            <div className="flex items-center space-x-2">
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium">
                ${activeReward} reward will be applied at checkout
              </span>
            </div>
            <button
              onClick={handleClearReward}
              disabled={isRestoring}
              className={`bg-[#e05252] hover:bg-[#d64545] text-white text-xs sm:text-sm 
                       px-2.5 py-1 rounded transition-all duration-200 whitespace-nowrap
                       hover:shadow-md active:scale-95 transform
                       ${isRestoring ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isRestoring ? 'Restoring...' : "Don't use reward"}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 