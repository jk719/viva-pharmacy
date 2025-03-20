import { EventEmitter } from 'events';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

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

class PrescriptionTracker extends EventEmitter {
  constructor() {
    super();
  }

  async trackEvent(eventType, data) {
    try {
      await dbConnect();
      
      const event = await PrescriptionEvent.create({
        eventType,
        prescriptionId: data.prescriptionId,
        userId: data.userId,
        metadata: data,
        timestamp: new Date()
      });

      this.emit(eventType, data);
      return event;
    } catch (error) {
      console.error('Tracking error:', error);
    }
  }

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
}

export const prescriptionTracker = new PrescriptionTracker(); 