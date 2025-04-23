/**
 * Constants for user data property names to ensure consistency across the application
 * 
 * Using constants instead of direct string literals helps prevent typos and
 * facilitates refactoring if property names need to change in the future.
 */

export const USER_DATA_PROPS = {
  // Loyalty points related properties
  POINTS: 'vivaBucks',
  LIFETIME_POINTS: 'cumulativePoints', 
  TIER: 'currentTier',
  MULTIPLIER: 'pointsMultiplier',
  REWARD_HISTORY: 'rewardHistory',
  
  // User profile related properties
  EMAIL: 'email',
  NAME: 'name',
  PHONE: 'phoneNumber',
  ADDRESSES: 'addresses',
  
  // State and metadata properties
  LAST_LOGIN: 'lastLogin',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt'
};

/**
 * Constants for profile API response fields
 * Use these when accessing data returned from the API endpoints
 */
export const API_RESPONSE_PROPS = {
  // Response metadata
  SUCCESS: 'success',
  ERROR: 'error',
  MESSAGE: 'message',
  
  // Data containers
  USER: 'user',
  DATA: 'data',
  POINTS: 'points',
  TIER: 'tier',
  HISTORY: 'history'
};
