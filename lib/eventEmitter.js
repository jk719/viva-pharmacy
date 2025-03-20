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
  HEARTBEAT: 'HEARTBEAT'
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

// Add error handling
eventEmitter.on('error', (error) => {
  console.error('EventEmitter error:', error);
});

// Add payment event handlers
eventEmitter.on(Events.PAYMENT_STARTED, (data) => {
  console.log('🎯 Payment started event received:', data);
  paymentTracker.startPayment(data);
});

eventEmitter.on(Events.PAYMENT_COMPLETED, (data) => {
  console.log('💰 Payment completed event received:', data);
  const payment = paymentTracker.completePayment(data);
  
  if (payment && !payment.processed) {
    // Mark payment as processed
    payment.processed = true;
    
    // Add this code for mobile support
    if (typeof window !== 'undefined') {
      try {
        // Store in localStorage to help with mobile
        localStorage.setItem('viva_payment_completed', JSON.stringify({
          timestamp: Date.now(),
          data
        }));
        
        // Dispatch a custom event
        const customEvent = new CustomEvent('viva:payment:completed', { 
          detail: data 
        });
        window.dispatchEvent(customEvent);
        
        // Directly call refresh if available
        if (typeof window.refreshLoyaltyData === 'function') {
          setTimeout(() => window.refreshLoyaltyData(), 500);
        }
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
};

// Add connection status handling
eventEmitter.on(Events.CONNECTION_STATUS, (data) => {
  const { userId, status } = data;
  connectionStatus.set(userId, { status, timestamp: Date.now() });
});

// Add ping interval for browser environments
if (typeof window !== 'undefined') {
  const pingInterval = setInterval(() => {
    eventEmitter.emit(Events.PING, {
      type: Events.PING,
      timestamp: new Date().toISOString()
    });
  }, 20000);

  // Add cleanup method to eventEmitter
  eventEmitter.cleanup = () => {
    clearInterval(pingInterval);
    cleanup();
  };
}

// Export eventEmitter as default and named export
export { eventEmitter, paymentTracker };
export default eventEmitter;  