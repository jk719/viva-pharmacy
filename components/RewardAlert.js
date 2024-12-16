'use client';

import { useRewardsStore } from '@/lib/stores/rewardsStore';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { useEffect } from 'react';

export default function RewardAlert() {
  const { data: session } = useSession();
  const { activeReward, clearActiveReward } = useRewardsStore();

  // Clear rewards when session changes (including logout)
  useEffect(() => {
    if (!session) {
      clearActiveReward();
    }
  }, [session, clearActiveReward]);

  const handleClearReward = async () => {
    // First clear the active reward from the store
    clearActiveReward();

    // Then restore the points in the database
    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/user/vivabucks/${session.user.id}/restore`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: activeReward })
        });

        if (response.ok) {
          // Emit events to update UI
          eventEmitter.emit(Events.POINTS_UPDATED);
          eventEmitter.emit(Events.REWARD_RESTORED);
        }
      } catch (error) {
        console.error('Error restoring reward:', error);
      }
    }
  };

  if (!activeReward || !session) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
            className="bg-[#e05252] hover:bg-[#d64545] text-white text-xs sm:text-sm px-2.5 py-1 rounded transition-colors duration-200 whitespace-nowrap"
          >
            Don't use reward
          </button>
        </div>
      </div>
    </motion.div>
  );
} 