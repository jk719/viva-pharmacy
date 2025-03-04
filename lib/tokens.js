import crypto from 'crypto';

const TOKEN_TYPES = {
  VERIFICATION: 'verification',
  RESET: 'reset',
  SESSION: 'session',
  API: 'api'
};

// Enhanced token generation with type-specific salts
export const generateToken = (type = TOKEN_TYPES.VERIFICATION) => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(32).toString('hex');
  const salt = process.env.TOKEN_SECRET || 'fallback-secret';
  
  const hash = crypto
    .createHash('sha256')
    .update(`${type}-${timestamp}-${random}-${salt}`)
    .digest('hex');
    
  return `${type}_${timestamp}_${hash}`;
};

// Specific token generators
export const generateVerificationToken = () => generateToken(TOKEN_TYPES.VERIFICATION);
export const generateResetToken = () => generateToken(TOKEN_TYPES.RESET);
export const generateSessionToken = () => generateToken(TOKEN_TYPES.SESSION);

// Enhanced token validation
export const validateToken = (token, type) => {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('_');
  if (parts.length !== 3) return false;
  
  const [tokenType, timestamp, hash] = parts;
  if (tokenType !== type) return false;
  
  // Check token age
  const tokenAge = Date.now() - parseInt(timestamp);
  const maxAge = {
    [TOKEN_TYPES.VERIFICATION]: 24 * 60 * 60 * 1000, // 24 hours
    [TOKEN_TYPES.RESET]: 1 * 60 * 60 * 1000,        // 1 hour
    [TOKEN_TYPES.SESSION]: 30 * 24 * 60 * 60 * 1000 // 30 days
  }[type] || 0;
  
  return tokenAge < maxAge;
};

export const isTokenExpired = (expiryDate) => {
  if (!expiryDate) return true;
  return new Date(expiryDate) < new Date();
}; 