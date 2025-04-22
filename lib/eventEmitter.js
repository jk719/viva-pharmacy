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
  LOYALTY_UPDATE: 'loyaltyUpdate',
  PROGRESS_BAR_ANIMATION_COMPLETE: 'PROGRESS_BAR_ANIMATION_COMPLETE'
};

// Define critical events that should always be processed
const CRITICAL_EVENTS = new Set([
  Events.ORDER_CREATED,
  Events.PAYMENT_COMPLETED,
  Events.LOYALTY_UPDATE,
  Events.PROGRESS_BAR_ANIMATION_COMPLETE
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
    // Always allow loyalty updates to emit, no rate limiting
    if (type === Events.LOYALTY_UPDATE) {
      return true;
    }
    // Allow other critical events to bypass rate limiting but still block recursion
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
    // Set emitting flag for this event type
    eventTracking.isEmitting.set(type, true);
    
    if (!eventTracking.canEmitEvent(type)) {
      if (!CRITICAL_EVENTS.has(type)) {
        console.warn(`Rate limit exceeded or recursive emission prevented for event type: ${type}`);
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
    pingInterval = setInterval(() => {
      safeEmit(Events.PING, {
        type: Events.PING,
        timestamp: new Date().toISOString()
      });
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