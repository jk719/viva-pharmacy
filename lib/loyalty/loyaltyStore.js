import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateProgressToNextTier } from './loyaltyCalculator';
import { TIER_CONFIG } from './tierConfig';
import eventEmitter, { Events } from '@/lib/eventEmitter';

/**
 * Central Zustand store for loyalty state management
 * This replaces the previous context-based state management
 */
export const useLoyaltyStore = create(
  persist(
    (set, get) => ({
      // State
      userData: null,
      progressInfo: null,
      isLoading: true,
      isInitialized: false,
      pendingTransactions: [],
      lastUpdated: null,

      // Actions
      setUserData: (data) => {
        // Normalize the data to ensure consistent field names
        const normalizedData = {
          ...data,
          vivaBucks: typeof data.vivaBucks === 'number' ? data.vivaBucks : 0,
          cumulativeVivaBucks: typeof data.cumulativeVivaBucks === 'number' ? data.cumulativeVivaBucks : 0,
          currentTier: data.currentTier || "BRONZE",
          pointsMultiplier: data.pointsMultiplier || data.vivaBucksMultiplier || 1,
          vivaBucksMultiplier: data.vivaBucksMultiplier || data.pointsMultiplier || 1,
        };

        // Calculate progress info
        let progressInfo = null;
        if (typeof normalizedData.cumulativeVivaBucks === "number") {
          try {
            progressInfo = calculateProgressToNextTier(normalizedData.cumulativeVivaBucks, TIER_CONFIG);
          } catch (err) {
            console.error("Error calculating tier progress:", err);
          }
        }

        // Update state
        set({
          userData: normalizedData,
          progressInfo,
          isLoading: false,
          isInitialized: true,
          lastUpdated: new Date().toISOString()
        });

        return { userData: normalizedData, progressInfo };
      },

      fetchUserData: async () => {
        try {
          set({ isLoading: true });
          
          // Generate cache-busting query params
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 15);
          const url = `/api/user/profile?nocache=${timestamp}&r=${random}`;
          
          // Fetch with cache control headers
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0"
            },
            cache: "no-store",
            next: { revalidate: 0 }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Update state with fetched data
          return get().setUserData(data);
        } catch (error) {
          console.error('[LoyaltyStore] Error fetching user data:', error);
          set({ isLoading: false });
          return null;
        }
      },

      // Add optimistic update support for payments
      addVivaBucksOptimistic: (amount) => {
        const { userData } = get();
        
        if (!userData) return;
        
        // Create a pending transaction ID
        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Clone current user data for optimistic update
        const optimisticData = { 
          ...userData,
          vivaBucks: userData.vivaBucks + amount,
          cumulativeVivaBucks: userData.cumulativeVivaBucks + amount,
          lastOptimisticUpdate: new Date().toISOString()
        };
        
        // Add to pending transactions
        const pendingTx = { 
          id: transactionId, 
          amount, 
          type: 'EARN', 
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
        
        set(state => ({
          userData: optimisticData,
          pendingTransactions: [...state.pendingTransactions, pendingTx],
          lastUpdated: new Date().toISOString()
        }));
        
        // Recalculate progress info
        if (typeof optimisticData.cumulativeVivaBucks === "number") {
          try {
            const progressInfo = calculateProgressToNextTier(optimisticData.cumulativeVivaBucks, TIER_CONFIG);
            set({ progressInfo });
          } catch (err) {
            console.error("Error calculating tier progress:", err);
          }
        }
        
        return transactionId;
      },
      
      // Confirm a transaction was processed
      confirmTransaction: (transactionId, success = true) => {
        const { pendingTransactions } = get();
        
        const updatedTransactions = pendingTransactions.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: success ? 'completed' : 'failed' }
            : tx
        );
        
        set({ 
          pendingTransactions: updatedTransactions,
          lastUpdated: new Date().toISOString()
        });
        
        // If transaction failed, refresh data to get correct state
        if (!success) {
          get().fetchUserData();
        }
      },
      
      // Clear completed transactions that are older than a certain time
      cleanupTransactions: (maxAgeMs = 24 * 60 * 60 * 1000) => { // 24 hours by default
        const { pendingTransactions } = get();
        const now = Date.now();
        
        const filteredTransactions = pendingTransactions.filter(tx => {
          if (tx.status === 'pending') return true;
          
          const txTime = new Date(tx.timestamp).getTime();
          return (now - txTime) < maxAgeMs;
        });
        
        set({ 
          pendingTransactions: filteredTransactions,
          lastUpdated: new Date().toISOString()
        });
      },
      
      // Reset the store
      reset: () => {
        set({
          userData: null,
          progressInfo: null,
          isLoading: false,
          isInitialized: false,
          pendingTransactions: [],
          lastUpdated: new Date().toISOString()
        });
      },
    }),
    {
      name: 'viva-loyalty-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        userData: state.userData,
        progressInfo: state.progressInfo,
        isInitialized: state.isInitialized,
        pendingTransactions: state.pendingTransactions.filter(tx => tx.status === 'pending'),
        lastUpdated: state.lastUpdated
      }),
    }
  )
);

// Setup event listeners for loyalty events
if (typeof window !== 'undefined') {
  // Listen for payment completed events
  eventEmitter.on(Events.PAYMENT_COMPLETED, (data) => {
    console.log('[LoyaltyStore] Payment completed event received:', {
      vivaBucksEarned: data.vivaBucksEarned,
      paymentId: data.paymentIntentId,
    });
    
    // Handle optimistic update if vivaBucks were earned
    if (data.vivaBucksEarned && data.vivaBucksEarned > 0) {
      const txId = useLoyaltyStore.getState().addVivaBucksOptimistic(data.vivaBucksEarned);
      
      // Refresh loyalty data after a short delay to confirm update
      setTimeout(() => {
        useLoyaltyStore.getState().fetchUserData()
          .then(() => {
            // Mark transaction as confirmed
            useLoyaltyStore.getState().confirmTransaction(txId, true);
          })
          .catch(() => {
            useLoyaltyStore.getState().confirmTransaction(txId, false);
          });
      }, 2000);
    } else {
      // Just refresh data if no points earned
      useLoyaltyStore.getState().fetchUserData();
    }
  });

  // Set up periodic cleanup of old transactions
  setInterval(() => {
    useLoyaltyStore.getState().cleanupTransactions();
  }, 60 * 60 * 1000); // Run hourly
}

export default useLoyaltyStore; 