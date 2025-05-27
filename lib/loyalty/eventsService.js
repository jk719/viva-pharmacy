import eventEmitter, { Events } from '@/lib/eventEmitter';
import { calculateProgressToNextTier } from './loyaltyCalculator';
import { TIER_CONFIG } from './tierConfig';
import { TIMING } from '@/constants/timing';

export const EVENT_TYPES = {
  PROMOTION: 'PROMOTION',
  FLASH_SALE: 'FLASH_SALE',
  BIRTHDAY: 'BIRTHDAY',
  HOLIDAY: 'HOLIDAY',
  POINTS_EARNED: 'POINTS_EARNED',
  POINTS_REDEEMED: 'POINTS_REDEEMED',
  LOYALTY_UPDATE: 'LOYALTY_UPDATE',
  POINTS_CALCULATION_COMPLETE: 'POINTS_CALCULATION_COMPLETE',
  POINTS_CALCULATION_ERROR: 'POINTS_CALCULATION_ERROR',
  EVENT_BENEFIT_APPLIED: 'EVENT_BENEFIT_APPLIED',
  ORDER_COMPLETE: 'ORDER_COMPLETE'
};

class LoyaltyEventsService {
  constructor() {
    this.activeSubscriptions = new Map();
    this.eventBuffer = new Map();
    this.maxBufferSize = 50;
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.activeTransactions = new Map();
    this.lastEmissionTime = new Map();
    this.minEmissionInterval = 50; // Minimum time between emissions for same user
    this.retryDelay = TIMING.API.RETRY_BASE; // Use timing constant
  }

  addToBuffer(userId, event) {
    if (!this.eventBuffer.has(userId)) {
      this.eventBuffer.set(userId, []);
    }
    const buffer = this.eventBuffer.get(userId);
    buffer.push({
      ...event,
      timestamp: new Date().toISOString(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    // Keep buffer size in check
    if (buffer.length > this.maxBufferSize) {
      buffer.shift();
    }
  }

  isTransactionActive(userId) {
    return this.activeTransactions.get(userId) || false;
  }

  beginTransaction(userId) {
    this.activeTransactions.set(userId, true);
  }

  endTransaction(userId) {
    if (!this.activeTransactions.has(userId)) return;
    
    // Small delay to ensure all events are captured
    setTimeout(() => this.endTransaction(userId), TIMING.LOYALTY.EVENT_DELAY);
  }

  async emitLoyaltyUpdate(userId, data, type = 'LOYALTY_UPDATE') {
    try {
      // Check if we need to force reset for ORDER_COMPLETE
      if (type === 'ORDER_COMPLETE') {
        // Clear any existing transactions to ensure this event goes through
        this.endTransaction(userId);
        this.lastEmissionTime.delete(userId);
      }
      
      // Prevent recursive emissions during active transactions
      if (this.isTransactionActive(userId) && type !== 'ORDER_COMPLETE') {
        console.log(`Skipping event emission during active transaction: ${type}`);
        return;
      }

      const event = {
        type,
        userId,
        data,
        timestamp: new Date().toISOString()
      };

      // Begin transaction for critical events
      if (type === 'ORDER_COMPLETE' || type === 'POINTS_CALCULATION_COMPLETE') {
        this.beginTransaction(userId);
      }

      this.addToBuffer(userId, event);
      await this.processEvent(userId, event);

      // End transaction after event processing is complete
      if (type === 'ORDER_COMPLETE' || type === 'POINTS_CALCULATION_COMPLETE') {
        // Small delay to ensure event is fully processed
        setTimeout(() => this.endTransaction(userId), 200);
      }
    } catch (error) {
      console.error('Error emitting loyalty update:', error);
      this.handleEventError(userId, error);
      
      // Ensure transaction is ended even if there's an error
      if (type === 'ORDER_COMPLETE' || type === 'POINTS_CALCULATION_COMPLETE') {
        this.endTransaction(userId);
      }
    }
  }

  async processEvent(userId, event) {
    const retryCount = this.retryAttempts.get(event.id) || 0;
    const now = Date.now();
    const lastEmission = this.lastEmissionTime.get(userId) || 0;
    
    try {
      // Ensure minimum time between emissions
      if (now - lastEmission < this.minEmissionInterval) {
        const delay = this.minEmissionInterval - (now - lastEmission);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Calculate new tier progress if points data is available
      if (event.data?.points || event.data?.vivaBucks || event.data?.totalPoints) {
        const points = event.data.points || event.data.vivaBucks || event.data.totalPoints;
        const progress = calculateProgressToNextTier(points, TIER_CONFIG);
        event.data.tierProgress = progress;
      }

      // Handle different event types
      switch (event.type) {
        case 'ORDER_COMPLETE':
          // Emit a notification that order is complete (using a non-deprecated event)
          eventEmitter.emit(Events.ORDER_CREATED, {
            ...event.data,
            type: Events.ORDER_CREATED,
            retryCount,
            loyaltyUpdated: true, // Flag to indicate loyalty data was updated
            timestamp: new Date().toISOString()
          });
          break;

        case 'POINTS_CALCULATION_COMPLETE':
          if (!this.isTransactionActive(userId)) {
            // Use a non-deprecated event for points calculation updates
            eventEmitter.emit(Events.CONNECTION_STATUS, {
              ...event.data,
              status: 'connected',
              userId,
              pointsUpdated: true, // Flag to indicate points were calculated
              retryCount,
              timestamp: new Date().toISOString()
            });
          }
          break;

        default:
          if (!this.isTransactionActive(userId)) {
            eventEmitter.emit(event.type, {
              ...event.data,
              retryCount,
              timestamp: new Date().toISOString()
            });
          }
          break;
      }

      // Update last emission time
      this.lastEmissionTime.set(userId, Date.now());

      // Clear retry count on successful emission
      if (retryCount > 0) {
        this.retryAttempts.delete(event.id);
      }
    } catch (error) {
      this.handleEventError(userId, error, event);
    }
  }

  handleEventError(userId, error, event = null) {
    console.error(`Loyalty event error for user ${userId}:`, error);

    if (event) {
      const retryCount = (this.retryAttempts.get(event.id) || 0) + 1;
      this.retryAttempts.set(event.id, retryCount);

      if (retryCount <= this.maxRetries) {
        // Exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        setTimeout(() => {
          this.processEvent(userId, event);
        }, delay);
      } else {
        console.error(`Max retries (${this.maxRetries}) reached for event:`, event);
        // Don't emit error events during transaction to prevent recursion
        if (!this.isTransactionActive(userId)) {
          eventEmitter.emit(Events.ERROR, {
            type: 'LOYALTY_EVENT_ERROR',
            userId,
            error: error.message,
            event,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  async emitPointsEarned(userId, points, source) {
    if (this.isTransactionActive(userId)) {
      console.log('Skipping points earned event during active transaction');
      return;
    }
    await this.emitLoyaltyUpdate(userId, {
      points,
      source,
      type: 'POINTS_EARNED'
    }, 'POINTS_EARNED');
  }

  async emitPointsRedeemed(userId, points, source) {
    if (this.isTransactionActive(userId)) {
      console.log('Skipping points redeemed event during active transaction');
      return;
    }
    await this.emitLoyaltyUpdate(userId, {
      points,
      source,
      type: 'POINTS_REDEEMED'
    }, 'POINTS_REDEEMED');
  }

  getBufferedEvents(userId, afterEventId = null) {
    const buffer = this.eventBuffer.get(userId) || [];
    if (!afterEventId) return [];
    
    const eventIndex = buffer.findIndex(event => event.id === afterEventId);
    return eventIndex >= 0 ? buffer.slice(eventIndex + 1) : [];
  }

  cleanup(userId) {
    this.eventBuffer.delete(userId);
    this.activeTransactions.delete(userId);
    // Clean up any stored retry attempts for this user's events
    for (const [eventId, _] of this.retryAttempts) {
      if (eventId.includes(userId)) {
        this.retryAttempts.delete(eventId);
      }
    }
  }

  // Add a method to forcibly clear any stuck transactions
  forceResetUser(userId) {
    this.endTransaction(userId);
    this.lastEmissionTime.delete(userId);
    for (const [eventId, _] of this.retryAttempts) {
      if (eventId.includes(userId)) {
        this.retryAttempts.delete(eventId);
      }
    }
    console.log(`Forcibly reset event tracking for user: ${userId}`);
  }

  async retryEmission(userId, event, data, retryCount = 0) {
    if (retryCount >= this.retryAttempts) {
      console.error(`[LoyaltyEvents] Failed to emit after ${this.retryAttempts} attempts`, {
        userId,
        event
      });
      return;
    }

    const delay = Math.min(TIMING.API.RETRY_BASE * Math.pow(2, retryCount), TIMING.API.RETRY_MAX);
    
    setTimeout(async () => {
      try {
        await this.emitWithRetry(userId, event, data, retryCount + 1);
      } catch (error) {
        console.error('[LoyaltyEvents] Retry failed:', error);
      }
    }, delay);
  }
}

// Create singleton instance
const loyaltyEventsService = new LoyaltyEventsService();
export default loyaltyEventsService; 