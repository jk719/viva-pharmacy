import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useRewardsStore = create(
  persist(
    (set, get) => ({
      activeReward: null,
      initialized: false,
      setActiveReward: (reward) => {
        const current = get().activeReward;
        if (current !== reward) {
          console.log('RewardsStore: Setting active reward:', reward);
          set({ activeReward: reward, initialized: true });
        }
      },
      clearActiveReward: () => {
        const current = get().activeReward;
        if (current !== null) {
          set({ activeReward: null, initialized: false });
        }
      },
    }),
    {
      name: 'reward-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrated rewards state:', state);
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