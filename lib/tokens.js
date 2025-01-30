import crypto from 'crypto';

export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const isTokenExpired = (expiryDate) => {
  if (!expiryDate) return true;
  return new Date(expiryDate) < new Date();
};

export const validateToken = (token) => {
  if (!token) return false;
  if (typeof token !== 'string') return false;
  // Check if token is a valid hex string of correct length (64 chars for 32 bytes)
  return /^[0-9a-f]{64}$/.test(token);
}; 