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
  if (!this.isModified('password')) {
    console.log('PRE SAVE - Password not modified, skipping hash');
    return next();
  }
  
  console.log("PRE SAVE - Password state:", {
    originalPassword: this.password,
    isAlreadyHashed: this.password.startsWith('$2a$'),
    passwordLength: this.password.length
  });

  // Check if password is already hashed
  if (this.password.startsWith('$2a$')) {
    console.log("PRE SAVE - WARNING: Password appears to be already hashed, skipping hash");
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 12);
    console.log("PRE SAVE - Successfully hashed password:", {
      hashedResult: this.password,
      resultLength: this.password.length
    });
    next();
  } catch (error) {
    console.error("PRE SAVE - Error hashing password:", error);
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("COMPARE - Starting password comparison:", {
      candidatePassword,
      candidateLength: candidatePassword.length,
      storedHash: this.password,
      storedLength: this.password.length,
      isCandidateHashed: candidatePassword.startsWith('$2a$')
    });

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("COMPARE - Password comparison result:", {
      isMatch,
      email: this.email // helpful for debugging specific users
    });
    return isMatch;
  } catch (error) {
    console.error("COMPARE - Error comparing password:", {
      error,
      email: this.email
    });
    return false;
  }
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
