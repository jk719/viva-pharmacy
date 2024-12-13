import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRewardsStore = create(
  persist(
    (set) => ({
      activeReward: null,
      setActiveReward: (amount) => set({ activeReward: amount }),
      clearActiveReward: () => set({ activeReward: null }),
    }),
    {
      name: 'reward-storage', // unique name for localStorage
    }
  )
); 