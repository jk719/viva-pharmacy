import mongoose from 'mongoose';

const specialEventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['BIRTHDAY', 'HOLIDAY', 'PROMOTION', 'FLASH_SALE', 'MILESTONE'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  pointMultiplier: {
    type: Number,
    default: 1,
    min: 1
  },
  minimumPurchase: {
    type: Number,
    min: 0
  },
  applicableTiers: [{
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'SAPPHIRE', 'DIAMOND', 'LEGEND']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.SpecialEvent || mongoose.model('SpecialEvent', specialEventSchema); 