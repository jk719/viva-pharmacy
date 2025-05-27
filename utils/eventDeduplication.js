/**
 * Centralized event deduplication utility
 * Handles deduplication logic for events across the application
 */

class EventDeduplicationManager {
  constructor() {
    this.processedEvents = new Map();
    this.cleanupInterval = null;
    this.maxCacheSize = 100;
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    
    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Generate a unique key for an event
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   * @returns {string} Unique key
   */
  generateEventKey(eventType, data) {
    const paymentId = data.paymentIntentId || data.orderId || data.payment_intent_id;
    const userId = data.userId || data.user_id;
    const timestamp = data.timestamp || Date.now();
    
    // For payment events, use payment ID as primary key
    if (eventType.includes('PAYMENT') && paymentId) {
      return `${eventType}:${paymentId}`;
    }
    
    // For user-specific events, combine user ID and event type
    if (userId) {
      return `${eventType}:${userId}:${Math.floor(timestamp / 1000)}`; // Round to second
    }
    
    // Fallback to timestamp-based key
    return `${eventType}:${timestamp}`;
  }

  /**
   * Check if an event has already been processed
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   * @param {number} ttl - Time to live in milliseconds
   * @returns {boolean} True if event is duplicate
   */
  isDuplicate(eventType, data, ttl = this.defaultTTL) {
    const key = this.generateEventKey(eventType, data);
    const entry = this.processedEvents.get(key);
    
    if (!entry) {
      return false;
    }
    
    // Check if entry is still valid
    const isValid = Date.now() - entry.timestamp < ttl;
    if (!isValid) {
      this.processedEvents.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Mark an event as processed
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   * @param {Object} metadata - Additional metadata
   */
  markAsProcessed(eventType, data, metadata = {}) {
    const key = this.generateEventKey(eventType, data);
    
    this.processedEvents.set(key, {
      timestamp: Date.now(),
      eventType,
      data,
      metadata
    });
    
    // Prevent memory leaks by limiting cache size
    if (this.processedEvents.size > this.maxCacheSize) {
      this.cleanup(true);
    }
  }

  /**
   * Process an event with deduplication
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   * @param {Function} processor - Function to process the event
   * @param {Object} options - Processing options
   * @returns {boolean} True if event was processed, false if duplicate
   */
  processEvent(eventType, data, processor, options = {}) {
    const { ttl = this.defaultTTL, force = false } = options;
    
    // Check for duplicates unless forced
    if (!force && this.isDuplicate(eventType, data, ttl)) {
      console.log(`Duplicate event detected: ${eventType}`, { 
        key: this.generateEventKey(eventType, data) 
      });
      return false;
    }
    
    try {
      // Mark as processed before processing to prevent race conditions
      this.markAsProcessed(eventType, data, { processed: true });
      
      // Process the event
      const result = processor(data);
      
      // If processor returns a promise, handle it
      if (result && typeof result.then === 'function') {
        result.catch(error => {
          console.error(`Error processing event ${eventType}:`, error);
          // Remove from processed events on error to allow retry
          const key = this.generateEventKey(eventType, data);
          this.processedEvents.delete(key);
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Error processing event ${eventType}:`, error);
      // Remove from processed events on error to allow retry
      const key = this.generateEventKey(eventType, data);
      this.processedEvents.delete(key);
      return false;
    }
  }

  /**
   * Clean up expired entries
   * @param {boolean} force - Force cleanup regardless of time
   */
  cleanup(force = false) {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of this.processedEvents.entries()) {
      const isExpired = now - entry.timestamp > this.defaultTTL;
      
      if (force || isExpired) {
        this.processedEvents.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`Event deduplication cleanup: removed ${removedCount} entries`);
    }
  }

  /**
   * Start automatic cleanup interval
   */
  startCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Clean up every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clear all processed events
   */
  clear() {
    this.processedEvents.clear();
  }

  /**
   * Get statistics about processed events
   */
  getStats() {
    return {
      totalProcessed: this.processedEvents.size,
      oldestEntry: Math.min(...Array.from(this.processedEvents.values()).map(e => e.timestamp)),
      newestEntry: Math.max(...Array.from(this.processedEvents.values()).map(e => e.timestamp))
    };
  }
}

// Create singleton instance
export const eventDeduplication = new EventDeduplicationManager();

// Export helper functions for common use cases
export const isPaymentDuplicate = (data) => {
  return eventDeduplication.isDuplicate('PAYMENT_COMPLETED', data);
};

export const markPaymentProcessed = (data) => {
  return eventDeduplication.markAsProcessed('PAYMENT_COMPLETED', data);
};

export const processPaymentEvent = (data, processor, options = {}) => {
  return eventDeduplication.processEvent('PAYMENT_COMPLETED', data, processor, options);
}; 