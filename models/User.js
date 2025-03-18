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
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  password: {
    type: String,
    required: function() {
      if (this.role === 'MANAGER' && (!this.isVerified || this.mustChangePassword)) {
        return false;
      }
      return true;
    },
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'MANAGER'],
    default: 'USER'
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  verificationToken: String,
  verificationExpires: Date,
  isVerified: {
    type: Boolean,
    default: false
  },
  lastVerificationSent: Date,
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
  mustChangePassword: {
    type: Boolean,
    default: false
  },
  stripeCustomerId: {
    type: String,
    sparse: true,
    unique: true
  },
  addresses: [addressSchema]
});

// Update timestamps
userSchema.pre('save', function(next) {
  console.log('🔵 Pre-save middleware triggered for user:', this.email);
  console.log('📝 Updated fields:', this.modifiedPaths());
  this.updatedAt = new Date();
  console.log('Saving user with verification token:', this.verificationToken);
  next();
});

// Update the password hashing middleware
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password') || !this.password) {
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

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!this.password) return false;

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

// Verification token methods
userSchema.methods.generateVerificationToken = async function() {
  console.log('Generating verification token for:', this.email);
  
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = token;
  this.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  this.lastVerificationSent = new Date();
  this.isVerified = false;
  
  console.log('Verification token generated:', {
    email: this.email,
    expires: this.verificationExpires,
    tokenLength: token.length
  });
  
  return token;
};

userSchema.methods.isVerificationTokenValid = function() {
  return this.verificationToken && 
         this.verificationExpires && 
         this.verificationExpires > Date.now();
};

userSchema.methods.markAsVerified = function() {
  this.isVerified = true;
  this.clearVerificationToken();
};

userSchema.methods.clearVerificationToken = function() {
  this.verificationToken = undefined;
  this.verificationExpires = undefined;
};

userSchema.statics.findByVerificationToken = function(token) {
  return this.findOne({
    verificationToken: token,
    verificationExpires: { $gt: Date.now() }
  });
};

// JSON transform
userSchema.set('toJSON', {
  transform: function(doc, ret, opt) {
    delete ret.password;
    delete ret.verificationToken;
    delete ret.verificationExpires;
    return ret;
  }
});

// Address management
userSchema.methods.setDefaultAddress = async function(addressId) {
  this.addresses.forEach(addr => addr.isDefault = false);
  
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

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;