// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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
  vivaBucks: { 
    type: Number, 
    default: 0 
  },
  rewardPoints: { 
    type: Number, 
    default: 0 
  }
});

// Update timestamps
userSchema.pre('save', function(next) {
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

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;