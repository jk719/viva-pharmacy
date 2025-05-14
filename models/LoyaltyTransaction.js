import mongoose from "mongoose";

const LoyaltyTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["EARN", "SPEND", "EXPIRE", "ADJUST", "REFUND"],
      required: true,
    },
    source: {
      type: String,
      enum: ["purchase", "referral", "admin", "promotion", "refund", "system", "redemption", "other"],
      required: true,
    },
    sourceId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    metadata: {
      type: Object,
      default: {},
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    processingDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
LoyaltyTransactionSchema.index({ userId: 1, createdAt: -1 });
LoyaltyTransactionSchema.index({ source: 1, sourceId: 1 }, { sparse: true });
LoyaltyTransactionSchema.index({ createdAt: -1 });
LoyaltyTransactionSchema.index({ status: 1 });

// Ensure the model is only compiled once
export const LoyaltyTransaction = 
  mongoose.models.LoyaltyTransaction || 
  mongoose.model("LoyaltyTransaction", LoyaltyTransactionSchema); 