import { Analytics } from '@segment/analytics-node';
import eventEmitter, { Events } from '@/lib/eventEmitter';

const analytics = new Analytics({ writeKey: process.env.SEGMENT_WRITE_KEY });

class PrescriptionTracker {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    eventEmitter.on(Events.PRESCRIPTION_UPLOADED, this.trackUpload.bind(this));
    eventEmitter.on(Events.PRESCRIPTION_VERIFIED, this.trackVerification.bind(this));
    eventEmitter.on(Events.PRESCRIPTION_REJECTED, this.trackRejection.bind(this));
    eventEmitter.on(Events.PRESCRIPTION_PURCHASED, this.trackPurchase.bind(this));
  }

  async trackUpload({ userId, prescriptionId, metadata }) {
    await analytics.track({
      userId,
      event: 'Prescription Uploaded',
      properties: {
        prescriptionId,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
  }

  async trackVerification({ userId, prescriptionId, verifiedBy, metadata }) {
    await analytics.track({
      userId,
      event: 'Prescription Verified',
      properties: {
        prescriptionId,
        verifiedBy,
        verificationTime: new Date().toISOString(),
        ...metadata
      }
    });
  }

  // ... similar methods for rejection and purchase ...
}

export const prescriptionTracker = new PrescriptionTracker(); 