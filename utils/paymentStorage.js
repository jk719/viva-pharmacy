/**
 * Centralized payment storage utility
 * Handles all localStorage operations for payment data
 */

import { TIMING } from '@/constants/timing';

const PAYMENT_STORAGE_KEY = 'viva_payment_completed';
const PAYMENT_DATA_TTL = TIMING.CACHE.PAYMENT; // 5 minutes

export const paymentStorage = {
  /**
   * Store payment completion data
   */
  store(data) {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }

    try {
      const storageData = {
        timestamp: Date.now(),
        data: data
      };
      
      localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(storageData));
      return true;
    } catch (error) {
      console.error('Error storing payment data:', error);
      return false;
    }
  },

  /**
   * Retrieve payment completion data
   * Returns null if data doesn't exist or is expired
   */
  retrieve() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const storedData = localStorage.getItem(PAYMENT_STORAGE_KEY);
      if (!storedData) return null;

      const parsedData = JSON.parse(storedData);
      
      // Check if data is still valid (within TTL)
      const isValid = Date.now() - parsedData.timestamp < PAYMENT_DATA_TTL;
      if (!isValid) {
        this.clear();
        return null;
      }

      return parsedData.data;
    } catch (error) {
      console.error('Error retrieving payment data:', error);
      this.clear(); // Clear corrupted data
      return null;
    }
  },

  /**
   * Clear payment completion data
   */
  clear() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }

    try {
      localStorage.removeItem(PAYMENT_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing payment data:', error);
      return false;
    }
  },

  /**
   * Check if payment data exists and is valid
   */
  exists() {
    return this.retrieve() !== null;
  }
}; 