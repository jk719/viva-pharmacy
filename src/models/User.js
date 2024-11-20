// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailVerificationToken: String,
  isVerified: { type: Boolean, default: false },
  verificationExpires: Date
});

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  console.log("Raw password before hashing:", this.password);
  this.password = await bcrypt.hash(this.password, 12);
  console.log("Hashed password after saving (registration):", this.password);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("Comparing passwords in login:", {
      candidatePassword,
      hashedPassword: this.password,
    });
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("Password match result for user:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error comparing password:", error);
    return false;
  }
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
