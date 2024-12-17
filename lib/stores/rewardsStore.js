import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useRewardsStore = create(
  persist(
    (set, get) => ({
      activeReward: null,
      initialized: false,
      setActiveReward: (amount) => set({ 
        activeReward: amount,
        initialized: true 
      }),
      clearActiveReward: () => set({ 
        activeReward: null,
        initialized: false 
      }),
    }),
    {
      name: 'reward-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Log when the store is rehydrated
        console.log('Rehydrated state:', state);
      },
    }
  )
);

// For debugging
if (typeof window !== 'undefined') {
  useRewardsStore.subscribe((state) => {
    console.log('Store updated:', state);
  });
} 