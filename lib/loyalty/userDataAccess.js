/**
 * User Data Access Layer
 * 
 * This module provides standardized access to user data, especially related to loyalty features.
 * Using these accessor functions instead of direct property access:
 * 1. Ensures consistent access patterns
 * 2. Provides central location for fallback values
 * 3. Allows for validation and data transformation
 * 4. Makes code more resilient to API changes
 */

import { USER_DATA_PROPS } from './constants/dataProperties';

/**
 * @typedef {Object} UserLoyaltyData
 * @property {number} vivaBucks - Current points balance
 * @property {number} cumulativePoints - Lifetime points earned
 * @property {string} currentTier - Current loyalty tier (BRONZE, SILVER, etc.)
 * @property {number} pointsMultiplier - Points earning multiplier
 * @property {Array} rewardHistory - History of loyalty transactions
 */

/**
 * Gets the user's points multiplier with fallback
 * @param {UserLoyaltyData} userData - User data from API
 * @returns {number} - Points multiplier
 */
export function getPointsMultiplier(userData) {
  return userData?.[USER_DATA_PROPS.MULTIPLIER] || 1;
}

/**
 * Gets user's current tier with fallback
 * @param {UserLoyaltyData} userData - User data from API 
 * @returns {string} - Current tier name
 */
export function getCurrentTier(userData) {
  return userData?.[USER_DATA_PROPS.TIER] || 'BRONZE';
}

/**
 * Gets user's current VivaBucks balance
 * @param {UserLoyaltyData} userData - User data from API
 * @returns {number} - Current points balance
 */
export function getCurrentPoints(userData) {
  return userData?.[USER_DATA_PROPS.POINTS] || 0;
}

/**
 * Gets user's lifetime accumulated points
 * @param {UserLoyaltyData} userData - User data from API
 * @returns {number} - Lifetime points
 */
export function getLifetimePoints(userData) {
  return userData?.[USER_DATA_PROPS.LIFETIME_POINTS] || 0;
}

/**
 * Gets user's reward history with fallback
 * @param {UserLoyaltyData} userData - User data from API
 * @returns {Array} - Reward history array
 */
export function getRewardHistory(userData) {
  return userData?.[USER_DATA_PROPS.REWARD_HISTORY] || [];
}

/**
 * Extracts complete loyalty data with proper fallbacks
 * @param {UserLoyaltyData} userData - User data from API 
 * @returns {Object} - Structured loyalty data
 */
export function extractLoyaltyData(userData) {
  if (!userData) return null;
  
  return {
    currentPoints: getCurrentPoints(userData),
    lifetimePoints: getLifetimePoints(userData),
    currentTier: getCurrentTier(userData),
    pointsMultiplier: getPointsMultiplier(userData),
    rewardHistory: getRewardHistory(userData)
  };
}
