export * from './verification';
export * from './password';

// Auth-related constants
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_NOT_VERIFIED: 'Please verify your email before signing in',
  TOKEN_EXPIRED: 'Verification token has expired',
  INVALID_TOKEN: 'Invalid verification token',
  EMAIL_IN_USE: 'Email already registered',
  WEAK_PASSWORD: 'Password does not meet requirements',
  SERVER_ERROR: 'An error occurred on the server',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Auth-related utility functions
export const isAuthenticated = (session) => {
  return !!session?.user;
};

export const isAdmin = (session) => {
  return session?.user?.role === USER_ROLES.ADMIN;
};

export const isVerified = (session) => {
  return session?.user?.isVerified === true;
};
