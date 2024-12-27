import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'MANAGER'],
    default: 'USER'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  name: String,
  emailVerificationToken: String,
  verificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationToken: String,
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add password reset and verification methods
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return resetToken;
};

userSchema.methods.generateVerificationToken = function() {
  this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return this.emailVerificationToken;
};

userSchema.methods.isVerificationTokenValid = function() {
  return this.emailVerificationToken && 
         this.verificationExpires && 
         this.verificationExpires > Date.now();
};

userSchema.methods.markAsVerified = function() {
  this.isVerified = true;
  this.emailVerificationToken = undefined;
  this.verificationExpires = undefined;
};

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Don't return sensitive data
userSchema.set('toJSON', {
  transform: function(doc, ret, opt) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.emailVerificationToken;
    delete ret.verificationExpires;
    return ret;
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User; 