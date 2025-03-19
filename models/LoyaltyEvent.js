import mongoose from 'mongoose';

const loyaltyEventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  pointMultiplier: { type: Number, default: 1 },
  minimumPurchase: Number,
  isActive: { type: Boolean, default: true },
  applicableTiers: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.LoyaltyEvent || mongoose.model('LoyaltyEvent', loyaltyEventSchema); 