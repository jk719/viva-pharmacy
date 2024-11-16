// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash the password before saving the user
// skipcq: JS-0045
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  // Log the raw password before hashing
  console.log("Raw password before hashing:", this.password);

  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);

  // Log the hashed password to verify it was saved correctly
  console.log("Hashed password after saving (registration):", this.password);
  next();
});

// Method to compare password with added logging
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Log the candidate password and hashed password before comparison
    console.log("Comparing passwords in login:", {
      candidatePassword,
      hashedPassword: this.password,
    });

    // Compare passwords
    const isMatch = await bcrypt.compare(candidatePassword, this.password);

    // Log the result of password comparison
    console.log("Password match result for user:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error comparing password:", error);
    return false;
  }
};

// Export the User model, reusing it if already compiled
const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
