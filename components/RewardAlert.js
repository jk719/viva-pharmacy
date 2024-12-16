'use client';

import { useRewardsStore } from '@/lib/stores/rewardsStore';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export default function RewardAlert() {
  const { data: session } = useSession();
  const { activeReward, clearActiveReward } = useRewardsStore();

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

  if (!activeReward) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-emerald-500 shadow-lg mt-auto"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm md:text-base font-medium">
              ${activeReward} reward will be applied at checkout
            </span>
          </div>
          <button
            onClick={handleClearReward}
            className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
          >
            <span className="text-sm hidden md:inline">Don't use reward</span>
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
} 