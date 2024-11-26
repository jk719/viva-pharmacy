// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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
  }
});

// Update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Add comparePassword method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
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

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;