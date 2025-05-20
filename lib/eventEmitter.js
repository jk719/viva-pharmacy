import mitt from 'mitt';

/**
 * Centralized application events enum
 * Use this instead of string literals for better type checking and IDE support
 */
export const Events = {
  // Payment related events
  PAYMENT_STARTED: 'payment:started',
  PAYMENT_PROCESSING: 'payment:processing',
  PAYMENT_COMPLETED: 'payment:completed',
  PAYMENT_FAILED: 'payment:failed',
  
  // User account events  
  USER_LOGGED_IN: 'user:logged_in',
  USER_LOGGED_OUT: 'user:logged_out',
  USER_PROFILE_UPDATED: 'user:profile_updated',
  
  // Loyalty related events
  LOYALTY_UPDATED: 'loyalty:updated',
  LOYALTY_REDEEMED: 'loyalty:redeemed',
  LOYALTY_TIER_CHANGED: 'loyalty:tier_changed',
  
  // Order related events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_FULFILLED: 'order:fulfilled',
  ORDER_CANCELLED: 'order:cancelled',
  
  // Cart events
  CART_UPDATED: 'cart:updated',
  CART_ITEM_ADDED: 'cart:item_added',
  CART_ITEM_REMOVED: 'cart:item_removed',
  CART_CLEARED: 'cart:cleared',
  
  // Connection events
  CONNECTION_STATUS: 'connection:status',
  
  // Analytics events
  ANALYTICS_EVENT: 'analytics:event'
};

/**
 * Create a singleton event emitter instance
 * This ensures we have one centralized event bus for the entire application
 */
const eventEmitter = mitt();

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  // Log all events in development for debugging
  const originalEmit = eventEmitter.emit;
  
  eventEmitter.emit = function(type, event) {
    console.log(`[EVENT] ${type}`, event);
    return originalEmit.call(this, type, event);
  };
}

// Define critical events that should always be processed and never rate-limited
const CRITICAL_EVENTS = new Set([
  Events.ORDER_CREATED,
  Events.ORDER_COMPLETED,
  Events.PAYMENT_COMPLETED,
  Events.PING, // Adding PING to critical events to prevent rate limiting errors
  Events.HEARTBEAT, // Also add HEARTBEAT for server-side events
  Events.LOYALTY_UPDATE, // Make LOYALTY_UPDATE critical to avoid delay after purchase
  Events.LOYALTY_VIVABUCKS_UPDATED, // Make sure loyalty points update is processed immediately
  Events.LOYALTY_ANIMATION_COMPLETE, // Ensure animation completion event is processed - HIGHEST PRIORITY
]);

// Define absolute priority events that break through any rate limiting
// These are crucial for the checkout and animation flow
const ABSOLUTE_PRIORITY_EVENTS = new Set([
  Events.LOYALTY_ANIMATION_COMPLETE, // Animation completion MUST be processed
  Events.PAYMENT_COMPLETED          // Payment completion MUST be processed
]);

// Event tracking
const eventTracking = {
  lastEventTime: new Map(),
  eventCounts: new Map(),
  maxEventsPerMinute: 60,
  isEmitting: new Map(), // Track emission state per event type
  
  trackEvent(type) {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const key = `${type}-${minute}`;
    
    const count = (this.eventCounts.get(key) || 0) + 1;
    this.eventCounts.set(key, count);
    this.lastEventTime.set(type, now);
    
    // Cleanup old entries
    for (const [oldKey] of this.eventCounts) {
      const [, oldMinute] = oldKey.split('-');
      if (parseInt(oldMinute) < minute) {
        this.eventCounts.delete(oldKey);
      }
    }
    
    return count <= this.maxEventsPerMinute;
  },
  
  canEmitEvent(type) {
    // Absolute priority events always bypass all checks
    if (ABSOLUTE_PRIORITY_EVENTS.has(type)) {
      return true; // Always allow absolute priority events
    }
    
    // Critical events bypass rate limiting but still block recursion
    if (CRITICAL_EVENTS.has(type)) {
      return !this.isEmitting.get(type);
    }
    
    // Check if this event type is currently being emitted
    if (this.isEmitting.get(type)) {
      return false;
    }
    
    const lastTime = this.lastEventTime.get(type);
    if (!lastTime) return true;
    
    const now = Date.now();
    if (now - lastTime < 100) { // Prevent rapid-fire events
      return false;
    }
    
    return this.trackEvent(type);
  }
};

// Payment tracker implementation
const paymentTracker = {
  activePayments: new Map(),
  
  startPayment(data) {
    const { paymentIntentId, userId, amount } = data;
    console.log('🔄 Starting payment tracking:', {
      paymentIntentId,
      userId,
      amount
    });
    
    this.activePayments.set(paymentIntentId, {
      startTime: Date.now(),
      status: 'started',
      userId,
      amount
    });
  },
  
  completePayment(data) {
    const { paymentIntentId } = data;
    console.log('✅ Completing payment tracking:', data);
    
    if (this.activePayments.has(paymentIntentId)) {
      const payment = this.activePayments.get(paymentIntentId);
      this.activePayments.set(paymentIntentId, {
        ...payment,
        status: 'completed',
        completedAt: Date.now()
      });
      
      return {
        ...payment,
        status: 'completed',
        completedAt: Date.now()
      };
    }
    return null;
  }
};

// Keep track of timeouts
const timeouts = new Map();

// Clear existing timeout if it exists
const clearExistingTimeout = (key) => {
  if (timeouts.has(key)) {
    clearTimeout(timeouts.get(key));
    timeouts.delete(key);
  }
};

// Enhanced emit function with improved rate limiting and recursion checks
const safeEmit = (type, data) => {
  // 1. Check for Recursion: Is this event type ALREADY being emitted?
  if (eventTracking.isEmitting.get(type)) {
    console.warn(`Recursive emission prevented for event type: ${type}`);
    return; // Prevent recursive call
  }

  // 2. Check Rate Limiting (only for non-critical/non-absolute events)
  if (!CRITICAL_EVENTS.has(type) && !ABSOLUTE_PRIORITY_EVENTS.has(type)) {
    // Check rapid-fire (e.g., < 100ms)
    const lastTime = eventTracking.lastEventTime.get(type);
    if (lastTime && (Date.now() - lastTime < 100)) {
      console.warn(`Rate limit (rapid-fire < 100ms) exceeded for event type: ${type}`);
      return;
    }
    // Check max events per minute (e.g., > 60)
    if (!eventTracking.trackEvent(type)) {
      console.warn(`Rate limit (${eventTracking.maxEventsPerMinute}/min) exceeded for event type: ${type}`);
      return;
    }
  }

  // --- If all checks passed, proceed with emission --- 
  try {
    // 3. Mark as emitting *NOW*
    eventTracking.isEmitting.set(type, true);

    // 4. Queue Handlers Asynchronously
    const handlers = eventEmitter.all.get(type);
    if (handlers && handlers.length > 0) {
      // Use Promise.resolve().then() to ensure handlers run in the next microtask tick,
      // allowing the current execution context to complete.
      Promise.resolve().then(() => {
        handlers.forEach(handler => {
          try {
            handler(data);
          } catch (handlerError) {
            console.error(`Error in async event handler for ${type}:`, handlerError);
          }
        });
      }).catch(queueError => {
        // Catch potential errors in the Promise queuing itself
        console.error(`Error queueing handlers for event ${type}:`, queueError);
      }).finally(() => {
        // 5. Reset emitting flag *after* handlers have been processed (or attempted)
        // Resetting here ensures the flag is false before the next potential emission
        eventTracking.isEmitting.set(type, false);
      });
    } else {
      // If no handlers, reset the flag immediately
      eventTracking.isEmitting.set(type, false);
    }

  } catch (error) {
    // Catch synchronous errors during the setup phase
    console.error(`Synchronous error emitting event ${type}:`, error);
    // Ensure the flag is reset even if there was a synchronous error
    eventTracking.isEmitting.set(type, false);
  }
  // Note: The finally block with the 100ms timeout is removed as the reset is now handled
  // more precisely within the Promise chain or immediately if no handlers exist.
};

// Add error handling without event emission
eventEmitter.on('error', (error) => {
  console.error('EventEmitter error:', error);
});

// Add payment event handlers with safe emit
eventEmitter.on(Events.PAYMENT_STARTED, (data) => {
  console.log('🎯 Payment started event received:', data);
  
  // Skip if we're on a non-checkout page like giveaway
  if (typeof window !== 'undefined' && window.location.pathname.includes('/giveaway')) {
    console.log('Ignoring payment started event on giveaway page');
    return;
  }
  
  paymentTracker.startPayment(data);
});

eventEmitter.on(Events.PAYMENT_COMPLETED, (processedEventData) => {
  console.log(`[EVENT_HANDLER] ${Events.PAYMENT_COMPLETED} received with processed data for PI: ${processedEventData.paymentIntentId}`);

  if (typeof window !== 'undefined' && window.location.pathname.includes('/giveaway')) {
    console.log(`[EVENT_HANDLER] ${Events.PAYMENT_COMPLETED}: Ignoring event on giveaway page.`);
    return;
  }

  // At this point, the event is verified, not a duplicate, and contains normalized data.
  // Modules listening to this event (like ModalContext) will act upon this clean data.
  // If this central handler had other specific tasks for a processed payment event, they would go here.
  // For now, it mainly serves as a pass-through for already processed events to other listeners.
});

// Add connection status tracking
const connectionStatus = new Map();

// Update cleanup function
const cleanup = () => {
  timeouts.forEach(clearTimeout);
  timeouts.clear();
  connectionStatus.clear();
  eventTracking.lastEventTime.clear();
  eventTracking.eventCounts.clear();
};

// Add connection status handling
eventEmitter.on(Events.CONNECTION_STATUS, (data) => {
  const { userId, status } = data;
  connectionStatus.set(userId, { status, timestamp: Date.now() });
});

// Add ping interval for browser environments
if (typeof window !== 'undefined') {
  const PING_INTERVAL = 30000; // Match SSE heartbeat interval
  let pingInterval = null;

  // Start ping interval
  const startPingInterval = () => {
    if (pingInterval) clearInterval(pingInterval);
    
    // Store the last ping time to prevent excessive pings
    let lastPingTime = 0;
    
    pingInterval = setInterval(() => {
      const now = Date.now();
      
      // Only send a ping if at least 25 seconds have passed since the last one
      // This adds a buffer to prevent rate limiting even with the critical event bypass
      if (now - lastPingTime >= 25000) {
        lastPingTime = now;
        
        // Emit ping with timestamp for tracking
        safeEmit(Events.PING, {
          type: Events.PING,
          timestamp: new Date().toISOString(),
          interval: PING_INTERVAL
        });
      }
    }, PING_INTERVAL);
  };

  // Start initial ping interval
  startPingInterval();

  // Add cleanup and restart methods to eventEmitter
  eventEmitter.cleanup = () => {
    if (pingInterval) clearInterval(pingInterval);
    cleanup();
  };

  eventEmitter.restartPing = startPingInterval;
}

// Replace the default emit with safe emit
const originalEmit = eventEmitter.emit;
eventEmitter.emit = (type, data) => {
  safeEmit(type, data);
};

// Export eventEmitter as default and named export
export { eventEmitter, paymentTracker };
export default eventEmitter;  