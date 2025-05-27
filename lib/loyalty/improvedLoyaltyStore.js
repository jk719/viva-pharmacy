import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateProgressToNextTier } from './loyaltyCalculator';
import { TIER_CONFIG, getTierFromPoints, migrateLegacyTier } from './tierConfig';
import eventEmitter, { Events } from '@/lib/eventEmitter';

// Phase 3 imports
import { 
  generateEarningForecasts, 
  generateContextualInsights, 
  generateUsageRecommendations 
} from './contextualIntelligenceService';
import { 
  checkSurpriseEligibility, 
  generateSurpriseCelebration,
  manageSurpriseFrequency 
} from './surpriseDelightService';
import { 
  generateAutomaticChoice, 
  predictUserNeeds, 
  generateContextualAutomation 
} from './zeroCognitiveLoadService';

/**
 * Enhanced Loyalty Store - Phase 3 Implementation
 * 
 * Phase 1 improvements:
 * 1. Unified VivaBucks model (single source of truth)
 * 2. Better error handling and data validation
 * 3. Automatic tier calculation and migration
 * 4. Improved cache management
 * 5. Real-time data synchronization
 * 
 * Phase 2 improvements:
 * 6. Smart redemption suggestions tracking
 * 7. User behavior pattern analysis
 * 8. Personalized milestone tracking
 * 9. Enhanced earning transparency
 * 
 * Phase 3 improvements:
 * 10. Contextual intelligence integration
 * 11. Surprise & delight management
 * 12. Zero cognitive load automation
 * 13. Predictive user assistance
 * 14. Natural language processing
 */

// Data validation helpers
const validateVivaBucksData = (data) => {
  if (!data || typeof data !== 'object') {
    console.warn('[LoyaltyStore] Invalid data provided, using defaults');
    return getDefaultUserData();
  }

  const validated = {
    ...getDefaultUserData(),
    ...data,
    availableVivaBucks: Math.max(0, parseInt(data.availableVivaBucks || data.vivaBucks || 0)),
    totalVivaBucksEarned: Math.max(0, parseInt(data.totalVivaBucksEarned || data.cumulativeVivaBucks || 0)),
    pointsMultiplier: Math.max(1, parseFloat(data.pointsMultiplier || 1)),
    currentTier: migrateLegacyTier(data.currentTier || 'EXPLORER'),
    lastUpdated: data.lastUpdated || new Date().toISOString(),
    dataVersion: '3.0' // Phase 3 version
  };

  // Ensure consistency
  validated.vivaBucks = validated.availableVivaBucks;
  validated.cumulativeVivaBucks = validated.totalVivaBucksEarned;

  // Calculate tier based on total earned
  const calculatedTier = getTierFromPoints(validated.totalVivaBucksEarned);
  if (calculatedTier && calculatedTier !== validated.currentTier) {
    validated.currentTier = calculatedTier;
    validated.pointsMultiplier = TIER_CONFIG[calculatedTier]?.multiplier || 1;
  }

  return validated;
};

const getDefaultUserData = () => ({
  availableVivaBucks: 0,
  totalVivaBucksEarned: 0,
  currentTier: 'EXPLORER',
  pointsMultiplier: 1,
  vivaBucks: 0,
  cumulativeVivaBucks: 0,
  rewardHistory: [],
  coupons: [],
  lastUpdated: new Date().toISOString(),
  dataVersion: '3.0'
});

// Phase 3: Default state structure
const getDefaultState = () => ({
  // Existing state
  userData: null,
  progressInfo: null,
  isLoading: true,
  error: null,
  isInitialized: false,
  cacheTimestamp: null,
  pendingTransactions: [],
  lastServerSync: null,

  // Phase 2 additions
  userBehaviorProfile: null,
  recentActivity: [],
  personalizedMilestones: null,
  smartRecommendations: null,
  earningTransparency: null,

  // Phase 3 additions
  contextualInsights: null,
  surpriseEligibility: [],
  activeSurprises: [],
  recentSurprises: [],
  cognitiveAutomation: null,
  predictiveNeeds: [],
  naturalLanguageState: null,
  phase3Initialized: false
});

export const useImprovedLoyaltyStore = create(
  persist(
    (set, get) => ({
      ...getDefaultState(),

      // Phase 3: Initialize contextual intelligence
      initializePhase3: async (orderHistory = []) => {
        const { userData } = get();
        if (!userData || get().phase3Initialized) return;

        try {
          // Initialize contextual insights
          const insights = await get().generateContextualInsights(null, orderHistory);
          
          // Check for surprise eligibility
          const surprises = checkSurpriseEligibility(userData, {}, orderHistory);
          
          // Generate cognitive automation
          const automation = generateContextualAutomation({}, userData, orderHistory);
          
          // Predict user needs
          const predictions = predictUserNeeds(userData, {}, orderHistory);

          set({
            contextualInsights: insights,
            surpriseEligibility: surprises,
            cognitiveAutomation: automation,
            predictiveNeeds: predictions,
            phase3Initialized: true
          });

          console.log('[LoyaltyStore] Phase 3 features initialized successfully');
        } catch (error) {
          console.error('[LoyaltyStore] Failed to initialize Phase 3:', error);
          // Set phase3Initialized to true even on error to prevent endless retry loops
          set({ phase3Initialized: true });
        }
      },

      // Existing methods...
      setUserData: (data) => {
        const validatedData = validateVivaBucksData(data);
        const progressInfo = calculateProgressToNextTier(validatedData.totalVivaBucksEarned || 0, TIER_CONFIG);
        
        set({ 
          userData: validatedData, 
          progressInfo,
          isLoading: false,
          cacheTimestamp: Date.now(),
          error: null
        });

        console.log('[LoyaltyStore] User data updated:', {
          available: validatedData.availableVivaBucks,
          total: validatedData.totalVivaBucksEarned,
          tier: validatedData.currentTier
        });

        // Phase 3: Auto-initialize contextual features
        get().initializePhase3();
      },

      // Phase 3: Generate contextual insights
      generateContextualInsights: async (currentOrder = null, orderHistory = []) => {
        const { userData } = get();
        if (!userData) return null;

        try {
          const insights = {
            forecasts: generateEarningForecasts(userData, orderHistory, currentOrder),
            contextual: generateContextualInsights(currentOrder || {}, userData, orderHistory),
            recommendations: generateUsageRecommendations(userData, orderHistory)
          };

          set({ contextualInsights: insights });
          return insights;
        } catch (error) {
          console.error('[LoyaltyStore] Failed to generate contextual insights:', error);
          return null;
        }
      },

      // Phase 3: Check and trigger surprises
      checkSurprises: async (orderData = {}, orderHistory = []) => {
        const { userData, recentSurprises } = get();
        if (!userData) return [];

        try {
          // Check surprise eligibility
          const eligibleSurprises = checkSurpriseEligibility(userData, orderData, orderHistory);
          
          // Manage frequency to prevent fatigue
          const frequencyCheck = manageSurpriseFrequency(userData, recentSurprises);
          
          if (!frequencyCheck.canReceiveSurprise) {
            console.log('[LoyaltyStore] Surprise frequency limit reached');
            return [];
          }

          const filteredSurprises = eligibleSurprises.slice(0, 1); // Max 1 surprise at a time
          
          set({ 
            surpriseEligibility: filteredSurprises,
            activeSurprises: filteredSurprises 
          });

          return filteredSurprises;
        } catch (error) {
          console.error('[LoyaltyStore] Failed to check surprises:', error);
          return [];
        }
      },

      // Phase 3: Trigger a surprise celebration
      triggerSurprise: (surpriseType, details = {}) => {
        const { userData, recentSurprises } = get();
        if (!userData) return null;

        try {
          const surprise = generateSurpriseCelebration(surpriseType, userData, details);
          
          // Add to recent surprises
          const updatedRecentSurprises = [
            surprise,
            ...recentSurprises.slice(0, 9) // Keep last 10
          ];

          set({ 
            recentSurprises: updatedRecentSurprises,
            activeSurprises: [surprise]
          });

          // Apply surprise effects (bonus VivaBucks, etc.)
          if (surprise.bonusAmount) {
            get().addVivaBucksOptimistic(surprise.bonusAmount, 'surprise_bonus');
          }

          return surprise;
        } catch (error) {
          console.error('[LoyaltyStore] Failed to trigger surprise:', error);
          return null;
        }
      },

      // Phase 3: Generate automatic choice recommendation
      generateSmartChoice: (orderData, orderHistory = []) => {
        const { userData } = get();
        if (!userData) return null;

        try {
          const choice = generateAutomaticChoice(orderData, userData, orderHistory);
          
          set(state => ({
            cognitiveAutomation: {
              ...state.cognitiveAutomation,
              lastChoice: choice,
              timestamp: Date.now()
            }
          }));

          return choice;
        } catch (error) {
          console.error('[LoyaltyStore] Failed to generate smart choice:', error);
          return null;
        }
      },

      // Phase 3: Update predictive needs
      updatePredictiveNeeds: (orderData = {}, orderHistory = []) => {
        const { userData } = get();
        if (!userData) return;

        try {
          const predictions = predictUserNeeds(userData, orderData, orderHistory);
          
          set({ predictiveNeeds: predictions });
          
          console.log('[LoyaltyStore] Predictive needs updated:', predictions.length, 'predictions');
        } catch (error) {
          console.error('[LoyaltyStore] Failed to update predictive needs:', error);
        }
      },

      // Phase 3: Get intelligent recommendations for order
      getIntelligentRecommendations: (orderData, orderHistory = []) => {
        const { userData, contextualInsights } = get();
        if (!userData) return null;

        try {
          return {
            smartChoice: get().generateSmartChoice(orderData, orderHistory),
            contextualInsights: contextualInsights || get().generateContextualInsights(orderData, orderHistory),
            surprises: get().checkSurprises(orderData, orderHistory),
            predictiveNeeds: get().predictiveNeeds || []
          };
        } catch (error) {
          console.error('[LoyaltyStore] Failed to get intelligent recommendations:', error);
          return null;
        }
      },

      // Existing methods continue...
      fetchUserData: async (forceRefresh = false) => {
        const { cacheTimestamp, userData } = get();
        const cacheAge = Date.now() - (cacheTimestamp || 0);
        const cacheExpired = cacheAge > 5 * 60 * 1000; // 5 minutes

        if (!forceRefresh && userData && !cacheExpired) {
          console.log('[LoyaltyStore] Using cached data');
          return userData;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/user/loyalty-status');
          
          if (!response.ok) {
            // If API not available, fallback to default demo data for testing
            if (response.status === 404 || response.status === 500) {
              console.warn('[LoyaltyStore] API not available, using demo data');
              const demoData = getDefaultUserData();
              const progressInfo = calculateProgressToNextTier(demoData.totalVivaBucksEarned || 0, TIER_CONFIG);

              set({ 
                userData: demoData, 
                progressInfo,
                isLoading: false,
                cacheTimestamp: Date.now(),
                error: null,
                lastServerSync: new Date().toISOString()
              });

              // Phase 3: Initialize contextual features
              get().initializePhase3();

              return demoData;
            }
            throw new Error(`Failed to fetch: ${response.status}`);
          }

          const data = await response.json();
          const validatedData = validateVivaBucksData(data);
          const progressInfo = calculateProgressToNextTier(validatedData.totalVivaBucksEarned || 0, TIER_CONFIG);

          set({ 
            userData: validatedData, 
            progressInfo,
            isLoading: false,
            cacheTimestamp: Date.now(),
            error: null,
            lastServerSync: new Date().toISOString()
          });

          // Phase 3: Initialize contextual features
          get().initializePhase3();

          return validatedData;
        } catch (error) {
          console.error('[LoyaltyStore] Failed to fetch user data:', error);
          
          // Fallback to demo data if fetch completely fails
          const demoData = getDefaultUserData();
          const progressInfo = calculateProgressToNextTier(demoData.totalVivaBucksEarned || 0, TIER_CONFIG);

          set({ 
            userData: demoData,
            progressInfo,
            error: `API unavailable: ${error.message}`, 
            isLoading: false,
            cacheTimestamp: Date.now(),
            lastServerSync: new Date().toISOString()
          });

          // Still initialize Phase 3 with demo data
          get().initializePhase3();

          return demoData;
        }
      },

      // Phase 2: Track redemption decisions for learning
      trackRedemptionDecision: (orderData, selectedAmount, allSuggestions) => {
        const decision = {
          timestamp: new Date().toISOString(),
          orderTotal: orderData.orderTotal,
          vivaBucksAvailable: get().userData?.availableVivaBucks || 0,
          selectedAmount,
          primarySuggestion: allSuggestions?.[0]?.vivaBucksToUse || 0,
          userChoice: selectedAmount === allSuggestions?.[0]?.vivaBucksToUse ? 'ACCEPTED_PRIMARY' : 
                      allSuggestions?.some(s => s.vivaBucksToUse === selectedAmount) ? 'SELECTED_ALTERNATIVE' :
                      selectedAmount === 0 ? 'DECLINED_ALL' : 'CUSTOM_AMOUNT'
        };

        set(state => ({
          recentActivity: [decision, ...state.recentActivity.slice(0, 49)] // Keep last 50 decisions
        }));

        // Update behavior profile based on decision
        const profile = get().userBehaviorProfile || { type: 'BALANCED', confidence: 0.5 };
        
        if (decision.userChoice === 'ACCEPTED_PRIMARY') {
          profile.confidence = Math.min(1.0, profile.confidence + 0.1);
        } else if (decision.userChoice === 'DECLINED_ALL') {
          profile.type = 'CONSERVATIVE';
          profile.confidence = Math.min(1.0, profile.confidence + 0.05);
        } else if (selectedAmount > decision.primarySuggestion) {
          profile.type = 'AGGRESSIVE';
          profile.confidence = Math.min(1.0, profile.confidence + 0.05);
        }

        get().updateBehaviorProfile(profile);
      },

      // Continue with existing methods...
      updateBehaviorProfile: (profile) => {
        set({ userBehaviorProfile: profile });
      },

      getBehaviorInsights: () => {
        const { recentActivity, userBehaviorProfile } = get();
        
        if (!recentActivity.length) {
          return {
            totalDecisions: 0,
            averageRedemptionAmount: 0,
            confidence: 0.3,
            pattern: 'INSUFFICIENT_DATA'
          };
        }

        const redemptions = recentActivity.filter(a => a.selectedAmount > 0);
        const averageRedemption = redemptions.length > 0 ? 
          redemptions.reduce((sum, r) => sum + r.selectedAmount, 0) / redemptions.length : 0;

        return {
          totalDecisions: recentActivity.length,
          averageRedemptionAmount: Math.round(averageRedemption),
          redemptionRate: redemptions.length / recentActivity.length,
          confidence: userBehaviorProfile?.confidence || 0.5,
          pattern: userBehaviorProfile?.type || 'BALANCED'
        };
      },

      // Enhanced VivaBucks info with Phase 3 predictions
      getEnhancedVivaBucksInfo: () => {
        const { userData, progressInfo, userBehaviorProfile, recentActivity, contextualInsights, predictiveNeeds } = get();
        if (!userData) return null;

        const basicInfo = {
          available: userData.availableVivaBucks,
          totalEarned: userData.totalVivaBucksEarned,
          currentTier: userData.currentTier,
          multiplier: userData.pointsMultiplier,
          redemptionValue: userData.availableVivaBucks * 0.01,
          nextTierPoints: progressInfo?.pointsToNext || 0
        };

        // Add Phase 2 & 3 enhancements
        const behaviorProfile = userBehaviorProfile || { type: 'BALANCED', confidence: 0.5 };
        const insights = get().getBehaviorInsights();

        return {
          ...basicInfo,
          // Phase 2 additions
          behaviorProfile,
          insights,
          predictedNextRedemption: insights.averageRedemptionAmount,
          recommendationTrust: insights.confidence,
          // Phase 3 additions
          contextualInsights: contextualInsights || null,
          predictiveNeeds: predictiveNeeds || [],
          hasIntelligentFeatures: true,
          phase3Ready: get().phase3Initialized
        };
      },

      // Continue with existing methods (addVivaBucksOptimistic, etc.)...
      addVivaBucksOptimistic: (amount, source = 'purchase') => {
        if (!amount || amount <= 0) return null;

        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const transaction = {
          id: transactionId,
          amount: Math.floor(amount),
          source,
          timestamp: new Date().toISOString(),
          status: 'pending'
        };

        set(state => {
          const currentVivaBucks = state.userData?.availableVivaBucks || 0;
          const currentTotal = state.userData?.totalVivaBucksEarned || 0;
          const newTotal = currentTotal + transaction.amount;
          
          // Check for tier upgrade
          const newTier = getTierFromPoints(newTotal);
          const tierUpgraded = newTier && newTier !== state.userData?.currentTier;
          
          const updatedUserData = {
            ...state.userData,
            availableVivaBucks: currentVivaBucks + transaction.amount,
            totalVivaBucksEarned: newTotal,
            vivaBucks: currentVivaBucks + transaction.amount,
            cumulativeVivaBucks: newTotal,
            currentTier: newTier || state.userData?.currentTier || 'EXPLORER',
            pointsMultiplier: TIER_CONFIG[newTier]?.multiplier || state.userData?.pointsMultiplier || 1,
            lastUpdated: new Date().toISOString()
          };

          console.log('[LoyaltyStore] Optimistic update applied:', {
            transaction: transactionId,
            amount: transaction.amount,
            newBalance: updatedUserData.availableVivaBucks,
            tierUpgraded,
            newTier
          });

          // Trigger tier upgrade surprise if applicable
          if (tierUpgraded) {
            setTimeout(() => {
              get().triggerSurprise('TIER_UPGRADE_CELEBRATION', {
                newTier,
                previousTier: state.userData?.currentTier,
                benefits: TIER_CONFIG[newTier]?.benefits || []
              });
            }, 1000);
          }

          return {
            userData: updatedUserData,
            progressInfo: calculateProgressToNextTier(updatedUserData.totalVivaBucksEarned || 0, TIER_CONFIG),
            pendingTransactions: [...state.pendingTransactions, transaction]
          };
        });

        return transactionId;
      },

      // Rest of existing methods...
      confirmTransaction: (transactionId, success) => {
        set(state => ({
          pendingTransactions: state.pendingTransactions.map(tx =>
            tx.id === transactionId 
              ? { ...tx, status: success ? 'confirmed' : 'failed' }
              : tx
          )
        }));

        if (!success) {
          console.warn('[LoyaltyStore] Transaction failed, reverting optimistic update:', transactionId);
          get().fetchUserData(true);
        }
      },

      cleanupTransactions: () => {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        set(state => ({
          pendingTransactions: state.pendingTransactions.filter(tx => 
            tx.status === 'pending' || new Date(tx.timestamp).getTime() > cutoffTime
          )
        }));
      },

      clearCache: () => {
        set({ 
          userData: null, 
          progressInfo: null, 
          cacheTimestamp: null,
          // Phase 3: Clear contextual cache
          contextualInsights: null,
          surpriseEligibility: [],
          cognitiveAutomation: null,
          predictiveNeeds: [],
          phase3Initialized: false
        });
        console.log('[LoyaltyStore] Cache cleared including Phase 3 data');
      },

      initialize: async () => {
        if (get().isInitialized) return;
        
        set({ isInitialized: true });
        console.log('[LoyaltyStore] Enhanced loyalty store initialized with Phase 3 features');
        
        try {
          await get().fetchUserData();
        } catch (error) {
          console.error('[LoyaltyStore] Failed to initialize:', error);
        }
      }
    }),
    
    {
      name: 'viva-loyalty-v3-phase3', // Updated storage name for Phase 3
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userData: state.userData,
        progressInfo: state.progressInfo,
        isInitialized: state.isInitialized,
        cacheTimestamp: state.cacheTimestamp,
        pendingTransactions: state.pendingTransactions.filter(tx => tx.status === 'pending'),
        lastServerSync: state.lastServerSync,
        // Phase 2 additions
        userBehaviorProfile: state.userBehaviorProfile,
        recentActivity: state.recentActivity.slice(0, 20), // Persist last 20 decisions
        personalizedMilestones: state.personalizedMilestones,
        // Phase 3 additions
        recentSurprises: state.recentSurprises.slice(0, 5), // Persist last 5 surprises
        phase3Initialized: state.phase3Initialized
      }),
      // Migrate old data format
      migrate: (persistedState, version) => {
        console.log('[LoyaltyStore] Migrating persisted state to Phase 3 from version:', version);
        
        if (persistedState?.userData && !persistedState.userData.dataVersion) {
          // Migrate from old format
          const migratedData = validateVivaBucksData(persistedState.userData);
          return {
            ...persistedState,
            userData: migratedData,
            // Initialize Phase 2 & 3 fields if missing
            userBehaviorProfile: persistedState.userBehaviorProfile || null,
            recentActivity: persistedState.recentActivity || [],
            personalizedMilestones: persistedState.personalizedMilestones || null,
            recentSurprises: persistedState.recentSurprises || [],
            phase3Initialized: false // Force re-initialization
          };
        }
        
        return persistedState;
      }
    }
  )
);

// Phase 3: Enhanced event listeners with intelligent features
if (typeof window !== 'undefined') {
  eventEmitter.on(Events.PAYMENT_COMPLETED, (data) => {
    console.log('[ImprovedLoyaltyStore] Payment completed with Phase 3 intelligence:', data);
    
    const store = useImprovedLoyaltyStore.getState();
    
    // Track redemption behavior if VivaBucks were used
    if (data.vivaBucksUsed && data.vivaBucksUsed > 0) {
      console.log(`[LoyaltyStore] VivaBucks used: ${data.vivaBucksUsed}`);
    }
    
    if (data.vivaBucksEarned && data.vivaBucksEarned > 0) {
      const txId = store.addVivaBucksOptimistic(data.vivaBucksEarned, 'purchase');
      
      // Phase 3: Check for surprises after earning
      setTimeout(() => {
        store.checkSurprises(data.orderData || {}, data.orderHistory || []);
      }, 2000);
      
      setTimeout(async () => {
        try {
          const result = await store.fetchUserData(true);
          store.confirmTransaction(txId, !!result);
        } catch (error) {
          console.error('[ImprovedLoyaltyStore] Failed to confirm transaction:', error);
          store.confirmTransaction(txId, false);
        }
      }, 3000);
    } else {
      store.fetchUserData(true);
    }
  });

  // Phase 3: Periodic cleanup and intelligence updates
  setInterval(() => {
    const store = useImprovedLoyaltyStore.getState();
    store.cleanupTransactions();
    
    // Clean old activity (keep last 50)
    const { recentActivity, recentSurprises } = store;
    if (recentActivity.length > 50) {
      useImprovedLoyaltyStore.setState({
        recentActivity: recentActivity.slice(0, 50)
      });
    }
    
    // Clean old surprises (keep last 10)
    if (recentSurprises.length > 10) {
      useImprovedLoyaltyStore.setState({
        recentSurprises: recentSurprises.slice(0, 10)
      });
    }
  }, 60 * 60 * 1000); // Every hour
}

export default useImprovedLoyaltyStore; 