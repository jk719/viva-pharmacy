/**
 * Centralized timing constants for the entire application
 * All durations are in milliseconds
 */

export const TIMING = {
  // Animation durations
  ANIMATION: {
    QUICK: 300,      // Quick transitions (e.g., button states)
    NORMAL: 500,     // Normal animations
    SLOW: 1500,      // Slow animations (e.g., loyalty animations)
    BANNER: 8000,    // Banner auto-play delays
    CAROUSEL: 15000  // Carousel auto-play delays
  },

  // API related timings
  API: {
    RETRY_BASE: 1000,     // Base retry delay
    RETRY_MAX: 30000,     // Maximum retry delay
    TIMEOUT: 60000,       // Request timeout
    DEBOUNCE: 100,        // API call debounce
    RATE_LIMIT_WINDOW: 60000  // Rate limit window (1 minute)
  },

  // Cache durations
  CACHE: {
    SHORT: 60 * 1000,         // 1 minute
    MEDIUM: 5 * 60 * 1000,    // 5 minutes
    LONG: 30 * 60 * 1000,     // 30 minutes
    DAY: 24 * 60 * 60 * 1000, // 24 hours
    PAYMENT: 5 * 60 * 1000    // Payment data TTL
  },

  // UI delays
  UI: {
    TOAST: 3000,              // Toast notification duration
    ERROR_TOAST: 4000,        // Error toast duration
    REDIRECT: 1500,           // Redirect delay after actions
    MODAL_CLOSE: 300,         // Modal close animation
    DEBOUNCE_INPUT: 300,      // Input debounce delay
    CLEANUP_DELAY: 30000      // Cleanup operations delay
  },

  // Loyalty specific
  LOYALTY: {
    ANIMATION: 1500,          // Loyalty animation duration
    DEBOUNCE: 100,            // Loyalty update debounce
    REFRESH_INTERVAL: 30000,  // Data refresh interval
    EVENT_DELAY: 200,         // Event processing delay
    CACHE_EXPIRE: 5 * 60 * 1000  // Loyalty cache expiration
  },

  // Authentication
  AUTH: {
    VERIFICATION_EXPIRE: 24 * 60 * 60 * 1000,  // 24 hours
    RESET_EXPIRE: 60 * 60 * 1000,              // 1 hour
    SESSION_CHECK: 30 * 60 * 1000              // 30 minutes
  }
};

// Helper functions
export const seconds = (s) => s * 1000;
export const minutes = (m) => m * 60 * 1000;
export const hours = (h) => h * 60 * 60 * 1000;
export const days = (d) => d * 24 * 60 * 60 * 1000; 