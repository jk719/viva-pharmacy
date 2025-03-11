import mitt from 'mitt';

const eventEmitter = mitt();

// Simple payment tracking implementation with enhanced logging
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

// Add error handling
eventEmitter.on('error', (error) => {
  console.error('EventEmitter error:', error);
});

// Add PING to Events enum
export const Events = {
  POINTS_UPDATED: 'POINTS_UPDATED',
  POINTS_RESET: 'pointsReset',
  REWARD_REDEEMED: 'REWARD_REDEEMED',
  REWARD_RESTORED: 'REWARD_RESTORED',
  PAYMENT_SUCCESS: 'paymentSuccess',
  CONNECTION_ERROR: 'connectionError',
  CONNECTION_RETRY: 'connectionRetry',
  PAYMENT_STARTED: 'PAYMENT_STARTED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PAYMENT_FAILED: 'paymentFailed',
  ORDER_CREATED: 'orderCreated',
  DEBOUNCED_POINTS_UPDATE: 'debouncedPointsUpdate',
  CONNECTION_STATUS: 'connectionStatus',
  PING: 'PING',
  HEARTBEAT: 'HEARTBEAT'
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

// Add payment event handlers with enhanced logging
eventEmitter.on(Events.PAYMENT_STARTED, (data) => {
  console.log('🎯 Payment started event received:', data);
  paymentTracker.startPayment(data);
});

eventEmitter.on(Events.PAYMENT_COMPLETED, (data) => {
  console.log('💰 Payment completed event received:', data);
  const payment = paymentTracker.completePayment(data);
  
  if (payment) {
    const timeoutKey = `points_update_${data.paymentIntentId}`;
    clearExistingTimeout(timeoutKey);
    
    // Schedule points update
    const timeout = setTimeout(() => {
      console.log('📊 Emitting points update after payment:', data);
      eventEmitter.emit(Events.POINTS_UPDATED, {
        ...data,
        type: 'POINTS_UPDATED',
        animate: true,
        timestamp: new Date().toISOString()
      });
    }, 500);
    
    timeouts.set(timeoutKey, timeout);
  }
});

// Debounced emit function with timeout tracking
const debouncedEmit = (eventName, data) => {
  const timeoutKey = `${eventName}_${data.userId}`;
  clearExistingTimeout(timeoutKey);
  
  const timeout = setTimeout(() => {
    console.log(`📢 Emitting debounced ${eventName}:`, data);
    eventEmitter.emit(eventName, {
      ...data,
      animate: true,
      timestamp: new Date().toISOString()
    });
    timeouts.delete(timeoutKey);
  }, 300);
  
  timeouts.set(timeoutKey, timeout);
};

// Add connection status tracking
const connectionStatus = new Map();

// Update cleanup function
const cleanup = () => {
  timeouts.forEach(clearTimeout);
  timeouts.clear();
  
  if (pingInterval) {
    clearInterval(pingInterval);
  }
  
  connectionStatus.clear();
};

// Add connection status handling
eventEmitter.on(Events.CONNECTION_STATUS, (data) => {
  const { userId, status } = data;
  connectionStatus.set(userId, { status, timestamp: Date.now() });
});

// Modify the ping interval
if (typeof window !== 'undefined') {
  const pingInterval = setInterval(() => {
    eventEmitter.emit(Events.PING, {
      type: Events.PING,
      timestamp: new Date().toISOString()
    });
  }, 20000);

  // Add cleanup for ping interval
  eventEmitter.cleanup = () => {
    clearInterval(pingInterval);
    timeouts.forEach(clearTimeout);
    timeouts.clear();
    connectionStatus.clear();
  };
}

export default eventEmitter;  