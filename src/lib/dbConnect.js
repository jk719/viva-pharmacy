// src/lib/dbConnect.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global cache for MongoDB connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Attempting to connect to MongoDB...");

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("Connected to MongoDB");
        
        // Add connection error handler
        mongoose.connection.on('error', (error) => {
          console.error('MongoDB connection error:', error);
          cached.conn = null;
          cached.promise = null;
        });

        // Add disconnection handler
        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected. Clearing connection cache.');
          cached.conn = null;
          cached.promise = null;
        });

        return mongoose;
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
        cached.promise = null;
        throw new Error(`MongoDB connection failed: ${error.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    // Clear the cached promise on error
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
