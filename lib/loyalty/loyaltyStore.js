// DEPRECATED: This store has been replaced by improvedLoyaltyStore.js as part of Phase 1 implementation
// Please update imports to use the new store for better reliability and unified data model
// This file is kept temporarily for backwards compatibility

console.warn('⚠️ DEPRECATED: lib/loyalty/loyaltyStore.js is deprecated. Please use lib/loyalty/improvedLoyaltyStore.js instead');

// Re-export the improved store to maintain backwards compatibility
export { useImprovedLoyaltyStore as useLoyaltyStore } from './improvedLoyaltyStore';
export { default } from './improvedLoyaltyStore'; 