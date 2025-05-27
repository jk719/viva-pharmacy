import { EventEmitter } from 'events';
import { Analytics } from '@segment/analytics-node';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Initialize analytics if available
const analytics = process.env.SEGMENT_WRITE_KEY 
  ? new Analytics({ writeKey: process.env.SEGMENT_WRITE_KEY })
  : null;

// Create a Schema for prescription events
const PrescriptionEventSchema = new mongoose.Schema({
  eventType: String,
  prescriptionId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  metadata: Object,
  timestamp: { type: Date, default: Date.now }
});

// Create the model (only if it doesn't exist)
const PrescriptionEvent = mongoose.models.PrescriptionEvent || 
  mongoose.model('PrescriptionEvent', PrescriptionEventSchema);

// Define prescription event types
export const PRESCRIPTION_EVENTS = {
  UPLOADED: 'PRESCRIPTION_UPLOADED',
  VERIFIED: 'PRESCRIPTION_VERIFIED',
  REJECTED: 'PRESCRIPTION_REJECTED',
  PURCHASED: 'PRESCRIPTION_PURCHASED',
  DELIVERED: 'PRESCRIPTION_DELIVERED'
};

class UnifiedPrescriptionTracker extends EventEmitter {
  constructor() {
    super();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen to prescription events from the main event emitter
    Object.values(PRESCRIPTION_EVENTS).forEach(eventType => {
      eventEmitter.on(eventType, this.handlePrescriptionEvent.bind(this, eventType));
    });
  }

  /**
   * Handle prescription events from the main event emitter
   */
  async handlePrescriptionEvent(eventType, data) {
    try {
      await this.trackEvent(eventType, data);
    } catch (error) {
      console.error(`Error handling prescription event ${eventType}:`, error);
    }
  }

  /**
   * Track a prescription event (both database and analytics)
   */
  async trackEvent(eventType, data) {
    try {
      // Track in database
      await this.trackInDatabase(eventType, data);
      
      // Track in analytics if available
      if (analytics) {
        await this.trackInAnalytics(eventType, data);
      }

      // Emit local event for other listeners
      this.emit(eventType, data);
      
      return true;
    } catch (error) {
      console.error('Prescription tracking error:', error);
      return false;
    }
  }

  /**
   * Track event in database
   */
  async trackInDatabase(eventType, data) {
    try {
      await dbConnect();
      
      const event = await PrescriptionEvent.create({
        eventType,
        prescriptionId: data.prescriptionId,
        userId: data.userId,
        metadata: data,
        timestamp: new Date()
      });

      console.log(`Prescription event tracked in database: ${eventType}`, event._id);
      return event;
    } catch (error) {
      console.error('Database tracking error:', error);
      throw error;
    }
  }

  /**
   * Track event in analytics
   */
  async trackInAnalytics(eventType, data) {
    if (!analytics) {
      console.warn('Analytics not configured, skipping analytics tracking');
      return;
    }

    try {
      const { userId, prescriptionId, metadata = {} } = data;
      
      // Map event types to analytics event names
      const analyticsEventMap = {
        [PRESCRIPTION_EVENTS.UPLOADED]: 'Prescription Uploaded',
        [PRESCRIPTION_EVENTS.VERIFIED]: 'Prescription Verified',
        [PRESCRIPTION_EVENTS.REJECTED]: 'Prescription Rejected',
        [PRESCRIPTION_EVENTS.PURCHASED]: 'Prescription Purchased',
        [PRESCRIPTION_EVENTS.DELIVERED]: 'Prescription Delivered'
      };

      const analyticsEventName = analyticsEventMap[eventType] || eventType;

      await analytics.track({
        userId,
        event: analyticsEventName,
        properties: {
          prescriptionId,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });

      console.log(`Prescription event tracked in analytics: ${analyticsEventName}`);
    } catch (error) {
      console.error('Analytics tracking error:', error);
      throw error;
    }
  }

  /**
   * Track prescription upload
   */
  async trackUpload(data) {
    return this.trackEvent(PRESCRIPTION_EVENTS.UPLOADED, data);
  }

  /**
   * Track prescription verification
   */
  async trackVerification(data) {
    const verificationData = {
      ...data,
      verifiedBy: data.verifiedBy,
      verificationTime: new Date().toISOString()
    };
    return this.trackEvent(PRESCRIPTION_EVENTS.VERIFIED, verificationData);
  }

  /**
   * Track prescription rejection
   */
  async trackRejection(data) {
    const rejectionData = {
      ...data,
      rejectedBy: data.rejectedBy,
      rejectionReason: data.rejectionReason,
      rejectionTime: new Date().toISOString()
    };
    return this.trackEvent(PRESCRIPTION_EVENTS.REJECTED, rejectionData);
  }

  /**
   * Track prescription purchase
   */
  async trackPurchase(data) {
    const purchaseData = {
      ...data,
      purchaseTime: new Date().toISOString(),
      amount: data.amount || 0
    };
    return this.trackEvent(PRESCRIPTION_EVENTS.PURCHASED, purchaseData);
  }

  /**
   * Track prescription delivery
   */
  async trackDelivery(data) {
    const deliveryData = {
      ...data,
      deliveryTime: new Date().toISOString(),
      deliveryMethod: data.deliveryMethod || 'pickup'
    };
    return this.trackEvent(PRESCRIPTION_EVENTS.DELIVERED, deliveryData);
  }

  /**
   * Get prescription timeline from database
   */
  async getPrescriptionTimeline(prescriptionId) {
    try {
      await dbConnect();
      
      const events = await PrescriptionEvent.find({ prescriptionId })
        .sort({ timestamp: 1 });
      
      return events;
    } catch (error) {
      console.error('Timeline fetch error:', error);
      return [];
    }
  }

  /**
   * Get prescription events by user
   */
  async getUserPrescriptionEvents(userId, limit = 50) {
    try {
      await dbConnect();
      
      const events = await PrescriptionEvent.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit);
      
      return events;
    } catch (error) {
      console.error('User events fetch error:', error);
      return [];
    }
  }

  /**
   * Get prescription analytics summary
   */
  async getAnalyticsSummary(startDate, endDate) {
    try {
      await dbConnect();
      
      const matchStage = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      const summary = await PrescriptionEvent.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
            latestEvent: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return summary;
    } catch (error) {
      console.error('Analytics summary error:', error);
      return [];
    }
  }
}

// Create singleton instance
export const prescriptionTracker = new UnifiedPrescriptionTracker();

// Export the class for testing
export { UnifiedPrescriptionTracker }; 