import { REWARD_CONSTANTS } from './constants.js';
import { RewardsUtils } from './utils.js';

export const REWARDS_CONFIG = {
  ...REWARD_CONSTANTS,
  DEFAULT_TIER: 'STANDARD',
  
  // Helper functions
  getRewardAmount: RewardsUtils.getRewardAmount,
  getPointsToNextReward: RewardsUtils.getPointsToNextReward,
  getMembershipTier: RewardsUtils.getMembershipTier,
  calculatePointsEarned: RewardsUtils.calculatePointsEarned,
  formatPoints: RewardsUtils.formatPoints,
  formatCurrency: RewardsUtils.formatCurrency,
  getProgressToNextTier: RewardsUtils.getProgressToNextTier
};
