import mitt from 'mitt';

const eventEmitter = mitt();

// Simple payment tracking implementation
const paymentTracker = {
  activePayments: new Map(),
  
  startPayment(paymentIntentId) {
    console.log('🔄 Starting payment tracking:', paymentIntentId);
    this.activePayments.set(paymentIntentId, {
      startTime: Date.now(),
      status: 'started'
    });
  },
  
  completePayment(paymentIntentId) {
    console.log('✅ Completing payment tracking:', paymentIntentId);
    if (this.activePayments.has(paymentIntentId)) {
      this.activePayments.set(paymentIntentId, {
        ...this.activePayments.get(paymentIntentId),
        status: 'completed',
        completedAt: Date.now()
      });
    }
  },
  
  getPaymentStatus(paymentIntentId) {
    return this.activePayments.get(paymentIntentId)?.status || 'unknown';
  }
};

// Add error handling
eventEmitter.on('error', (error) => {
  console.error('EventEmitter error:', error);
});

export const Events = {
  POINTS_UPDATED: 'pointsUpdated',
  POINTS_RESET: 'pointsReset',
  REWARD_REDEEMED: 'rewardRedeemed',
  REWARD_RESTORED: 'rewardRestored',
  PAYMENT_SUCCESS: 'paymentSuccess',
  CONNECTION_ERROR: 'connectionError',
  CONNECTION_RETRY: 'connectionRetry',
  PAYMENT_STARTED: 'paymentStarted',
  PAYMENT_COMPLETED: 'paymentCompleted',
  PAYMENT_FAILED: 'paymentFailed',
  ORDER_CREATED: 'orderCreated',
  DEBOUNCED_POINTS_UPDATE: 'debouncedPointsUpdate'
};

// Add keep-alive ping
setInterval(() => {
  eventEmitter.emit('ping');
}, 20000);

// Add payment event handlers
eventEmitter.on(Events.PAYMENT_STARTED, (paymentIntentId) => {
  paymentTracker.startPayment(paymentIntentId);
});

eventEmitter.on(Events.PAYMENT_COMPLETED, (paymentIntentId) => {
  paymentTracker.completePayment(paymentIntentId);
});

// Add debouncing for frequent events
const debouncedEmit = (eventName, data) => {
  if (eventName === Events.POINTS_UPDATED) {
    clearTimeout(window._pointsUpdateTimeout);
    window._pointsUpdateTimeout = setTimeout(() => {
      eventEmitter.emit(eventName, data);
    }, 300);
  } else {
    eventEmitter.emit(eventName, data);
  }
};

export default eventEmitter;  