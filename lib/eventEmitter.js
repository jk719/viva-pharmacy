import mitt from 'mitt';

// Create the event emitter instance
const eventEmitter = mitt();

// Define Events enum
export const Events = {
  PAYMENT_SUCCESS: 'paymentSuccess',
  CONNECTION_ERROR: 'connectionError',
  CONNECTION_RETRY: 'connectionRetry',
  PAYMENT_STARTED: 'PAYMENT_STARTED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PAYMENT_FAILED: 'paymentFailed',
  ORDER_CREATED: 'orderCreated',
  CONNECTION_STATUS: 'connectionStatus',
  PING: 'PING',
  HEARTBEAT: 'HEARTBEAT',
  ERROR: 'ERROR',
  
  // Loyalty and animation related events
  LOYALTY_UPDATE: 'loyalty_update',
  LOYALTY_POINTS_UPDATED: 'loyalty_points_updated',
  LOYALTY_ANIMATION_COMPLETE: 'loyalty_animation_complete',
  PROGRESS_BAR_ANIMATION_COMPLETE: 'progress_bar_animation_complete'
};

// Define critical events that should always be processed and never rate-limited
const CRITICAL_EVENTS = new Set([
  Events.ORDER_CREATED,
  Events.PAYMENT_COMPLETED,
  Events.PING, // Adding PING to critical events to prevent rate limiting errors
  Events.HEARTBEAT, // Also add HEARTBEAT for server-side events
  Events.LOYALTY_UPDATE, // Make LOYALTY_UPDATE critical to avoid delay after purchase
  Events.LOYALTY_POINTS_UPDATED, // Make sure loyalty points update is processed immediately
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

// Enhanced emit function with rate limiting and error handling
const safeEmit = (type, data) => {
  try {
    // Set flag for this event type
    const isAlreadyEmitting = eventTracking.isEmitting.get(type);
    eventTracking.isEmitting.set(type, true);
    
    // Special handling for absolute priority events - they ALWAYS get processed
    if (ABSOLUTE_PRIORITY_EVENTS.has(type)) {
      console.log(`Processing absolute priority event: ${type}`);
      // Continue without any checks for these critical events
    }
    // Special bypass for PING and other critical events
    else if (type === Events.PING) {
      // Special handling for ping events
      // Continue without rate limiting or recursion checks
    } 
    // Normal event handling with rate limiting
    else if (!eventTracking.canEmitEvent(type)) {
      if (!CRITICAL_EVENTS.has(type)) {
        console.warn(`Rate limit exceeded or recursive emission prevented for event type: ${type}`);
      }
      // Reset flag if we're skipping this emission
      if (!isAlreadyEmitting) {
        // Only reset if this is a new emission attempt, not a recursive one
        eventTracking.isEmitting.set(type, false);
      }
      return;
    }
    
    // Use original mitt emit to prevent recursion
    const handlers = eventEmitter.all.get(type);
    if (handlers) {
      Promise.resolve().then(() => {
        handlers.forEach(handler => {
          try {
            handler(data);
          } catch (handlerError) {
            console.error(`Error in event handler for ${type}:`, handlerError);
          }
        });
      });
    }
  } catch (error) {
    console.error(`Error emitting event ${type}:`, error);
  } finally {
    // Reset emitting flag for this event type after a short delay
    setTimeout(() => {
      eventTracking.isEmitting.set(type, false);
    }, 100);
  }
};

// Add error handling without event emission
eventEmitter.on('error', (error) => {
  console.error('EventEmitter error:', error);
});

// Add payment event handlers with safe emit
eventEmitter.on(Events.PAYMENT_STARTED, (data) => {
  console.log('🎯 Payment started event received:', data);
  paymentTracker.startPayment(data);
});

eventEmitter.on(Events.PAYMENT_COMPLETED, (data) => {
  console.log('💰 Payment completed event received:', data);
  const payment = paymentTracker.completePayment(data);
  
  if (payment && !payment.processed) {
    payment.processed = true;
    
    // Only try to use localStorage in browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('viva_payment_completed', JSON.stringify({
          timestamp: Date.now(),
          data
        }));
      } catch (err) {
        console.error('Error handling payment event:', err);
      }
    }
  }
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