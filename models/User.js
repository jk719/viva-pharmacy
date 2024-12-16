// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { REWARDS_CONFIG } from '@/lib/rewards/config';

// Add address schema
const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  street: {
    type: String,
    required: [true, 'Street address is required']
  },
  apartment: {
    type: String
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    validate: {
      validator: function(v) {
        return /^\d{5}(-\d{4})?$/.test(v);
      },
      message: props => `${props.value} is not a valid ZIP code!`
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update the rewardHistory schema
const rewardHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'POINTS_EARNED',
      'REWARD_REDEEMED',
      'TIER_CHANGED',
      'REWARD_RESTORED'
    ]
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Optional fields based on type
  points: Number,         // For POINTS_EARNED
  adjustedPoints: Number, // For POINTS_EARNED
  multiplier: Number,     // For POINTS_EARNED
  amount: Number,         // For REWARD_REDEEMED and REWARD_RESTORED
  pointsUsed: Number,     // For REWARD_REDEEMED
  pointsRestored: Number, // Add this for REWARD_RESTORED
  oldTier: String,        // For TIER_CHANGED
  newTier: String,        // For TIER_CHANGED
  tier: String,           // Current tier at time of action
  source: String         // Source of points/reward
}, { 
  timestamps: true 
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty phone number
        return /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  verificationExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationToken: String,
  // Add addresses array
  addresses: [addressSchema],
  // Add reward history to user schema
  rewardHistory: [rewardHistorySchema],
  vivaBucks: {
    type: Number,
    default: 0
  },
  rewardPoints: {
    type: Number,
    default: 0
  },
  cumulativePoints: {
    type: Number,
    default: 0
  },
  currentTier: {
    type: String,
    default: 'Standard'
  },
  pointsMultiplier: {
    type: Number,
    default: 1
  },
  nextRewardMilestone: {
    type: Number,
    default: 100  // First milestone
  }
});

// Update timestamps
userSchema.pre('save', function(next) {
  console.log('🔵 Pre-save middleware triggered for user:', this.email);
  console.log('📝 Updated fields:', this.modifiedPaths());
  this.updatedAt = new Date();
  console.log('Saving user with verification token:', this.verificationToken);
  next();
});

// Hash password before saving - FIXED VERSION
userSchema.pre('save', async function(next) {
  try {
    // Only hash if password is modified
    if (!this.isModified('password')) {
      return next();
    }

    console.log('Pre-save: Hashing password for user:', this.email);
    console.log('Original password length:', this.password?.length);

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    console.log('Hashed password length:', this.password?.length);
    console.log('Password hashed successfully');
    
    return next();
  } catch (error) {
    console.error('Error in password hashing:', error);
    return next(error);
  }
});

// Improve comparePassword method with logging
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing passwords for user:', this.email);
    console.log('Stored hash length:', this.password?.length);
    console.log('Candidate password length:', candidatePassword?.length);

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Password comparison failed');
  }
};

// Generate verification token
userSchema.methods.generateVerificationToken = function() {
  this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  this.isVerified = false; // Ensure user is marked as unverified
  return this.emailVerificationToken;
};

// Check if verification token is valid
userSchema.methods.isVerificationTokenValid = function() {
  return this.emailVerificationToken && 
         this.verificationExpires && 
         this.verificationExpires > Date.now();
};

// Mark user as verified
userSchema.methods.markAsVerified = function() {
  this.isVerified = true;
  this.clearVerificationToken();
};

// Clear verification tokens
userSchema.methods.clearVerificationToken = function() {
  this.emailVerificationToken = undefined;
  this.verificationExpires = undefined;
};

// Static method to find user by verification token
userSchema.statics.findByVerificationToken = function(token) {
  return this.findOne({
    emailVerificationToken: token,
    verificationExpires: { $gt: Date.now() }
  });
};

// Ensure we don't return sensitive data in JSON
userSchema.set('toJSON', {
  transform: function(doc, ret, opt) {
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.verificationExpires;
    return ret;
  }
});

// Add method to handle default addresses
userSchema.methods.setDefaultAddress = async function(addressId) {
  // First, set all addresses to non-default
  this.addresses.forEach(addr => addr.isDefault = false);
  
  // Then set the specified address as default
  const address = this.addresses.id(addressId);
  if (address) {
    address.isDefault = true;
    await this.save();
    return true;
  }
  return false;
};

// Add logging to findOneAndUpdate
userSchema.pre('findOneAndUpdate', function() {
  console.log('🔵 Update operation triggered');
  console.log('📝 Update query:', JSON.stringify(this.getQuery(), null, 2));
  console.log('📝 Update data:', JSON.stringify(this.getUpdate(), null, 2));
});

// Add new methods for the rewards system
userSchema.methods.calculateTier = function() {
  const tierInfo = REWARDS_CONFIG.getMembershipTier(this.cumulativePoints);
  this.currentTier = tierInfo?.name || 'STANDARD';
  this.pointsMultiplier = tierInfo?.multiplier || 1.0;
};

userSchema.methods.calculateNextReward = function() {
  try {
    console.log('Starting calculateNextReward...');
    console.log('REWARDS_CONFIG structure:', {
      hasConfig: !!REWARDS_CONFIG,
      hasRewardRate: !!REWARDS_CONFIG?.REWARD_RATE,
      pointsNeeded: REWARDS_CONFIG?.REWARD_RATE?.POINTS_NEEDED
    });
    
    // Validate config
    if (!REWARDS_CONFIG?.REWARD_RATE?.POINTS_NEEDED) {
      throw new Error('Invalid REWARDS_CONFIG structure');
    }
    
    const pointsNeeded = REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED;
    const currentPoints = this.rewardPoints || 0;
    
    console.log('Current state:', {
      currentPoints,
      pointsNeeded,
      rewardPoints: this.rewardPoints,
      cumulativePoints: this.cumulativePoints
    });
    
    // Calculate next milestone
    const nextMilestone = Math.ceil(currentPoints / pointsNeeded) * pointsNeeded;
    
    console.log('Calculation details:', {
      currentPoints,
      pointsNeeded,
      nextMilestone,
      maxMilestone: REWARDS_CONFIG.MAX_MILESTONE,
      formula: `ceil(${currentPoints} / ${pointsNeeded}) * ${pointsNeeded}`
    });
    
    // Ensure milestone doesn't exceed MAX_MILESTONE
    this.nextRewardMilestone = Math.min(
      Math.max(pointsNeeded, nextMilestone),
      REWARDS_CONFIG.MAX_MILESTONE
    );
    
    console.log('Final milestone set to:', this.nextRewardMilestone);
    return this.nextRewardMilestone;
    
  } catch (error) {
    console.error('Error in calculateNextReward:', error);
    console.error('Current state:', {
      rewardPoints: this.rewardPoints,
      currentTier: this.currentTier,
      config: REWARDS_CONFIG?.REWARD_RATE
    });
    
    // Set safe default
    this.nextRewardMilestone = REWARDS_CONFIG?.REWARD_RATE?.POINTS_NEEDED || 100;
    return this.nextRewardMilestone;
  }
};

userSchema.methods.getRewardAmount = function() {
  return REWARDS_CONFIG.getRewardAmount(this.rewardPoints);
};

// Update the addPoints method to handle both regular and test points
userSchema.methods.addPoints = async function(points, isTest = false) {
  try {
    console.log(`🎯 Adding ${isTest ? 'test' : ''} points:`, points);
    
    const tierInfo = REWARDS_CONFIG.getMembershipTier(this.cumulativePoints);
    const multiplier = tierInfo?.multiplier || 1.0;
    const adjustedPoints = Math.floor(points * multiplier);
    
    // Update points
    this.rewardPoints += adjustedPoints;
    this.cumulativePoints += adjustedPoints;
    
    // Only add to history if not a test
    if (!isTest) {
      // Add points history entry
      this.rewardHistory.push({
        type: 'POINTS_EARNED',
        points: points,
        adjustedPoints: adjustedPoints,
        multiplier: multiplier,
        tier: this.currentTier,
        source: isTest ? 'test' : 'purchase'
      });
    }
    
    // Check for tier change
    const newTierInfo = REWARDS_CONFIG.getMembershipTier(this.cumulativePoints);
    if (newTierInfo?.name !== this.currentTier) {
      if (!isTest) {
        this.rewardHistory.push({
          type: 'TIER_CHANGED',
          oldTier: this.currentTier,
          newTier: newTierInfo.name,
          tier: newTierInfo.name
        });
      }
      this.currentTier = newTierInfo.name;
      this.pointsMultiplier = newTierInfo.multiplier;
    }
    
    this.calculateNextReward();
    await this.save();
    
    return {
      adjustedPoints,
      vivaBucks: this.vivaBucks,
      rewardPoints: this.rewardPoints,
      currentTier: this.currentTier,
      nextMilestone: this.nextRewardMilestone,
      multiplier
    };
  } catch (error) {
    console.error('❌ Error adding points:', error);
    throw error;
  }
};

// Update the redeemReward method to use the new schema
userSchema.methods.redeemReward = async function() {
  try {
    const pointsNeeded = REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED;
    const rewardAmount = this.getRewardAmount();
    
    if (rewardAmount === 0) {
      return {
        success: false,
        message: "Not enough points to redeem"
      };
    }

    // Add redemption history entry
    this.rewardHistory.push({
      type: 'REWARD_REDEEMED',
      amount: rewardAmount,
      pointsUsed: pointsNeeded,
      tier: this.currentTier
    });

    this.vivaBucks += rewardAmount;
    this.rewardPoints -= pointsNeeded;
    this.calculateNextReward();
    
    await this.save();

    return {
      success: true,
      rewardAmount,
      remainingPoints: this.rewardPoints,
      message: `Successfully redeemed $${rewardAmount} for ${pointsNeeded} points`
    };
  } catch (error) {
    console.error('❌ Error redeeming reward:', error);
    throw error;
  }
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;