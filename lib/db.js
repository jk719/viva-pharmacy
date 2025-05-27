import dbConnect from './dbConnect.js';

/**
 * Database connection utility
 * 
 * This is a compatibility layer that re-exports the existing
 * dbConnect function as connectDB to match the import expectations
 * in the API routes and migration files.
 */

// Export the connection function with the expected name
export default dbConnect;

// Also export as named export for flexibility
export const connectDB = dbConnect; 