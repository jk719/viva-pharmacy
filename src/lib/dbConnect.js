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

    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Set a timeout of 5 seconds
    })
    .then((mongoose) => {
      console.log("Connected to MongoDB");
      return mongoose;
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error.message); // Log specific error message
      throw new Error("Failed to connect to MongoDB");
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error; // Re-throw the error after logging
  }

  return cached.conn;
}

export default dbConnect;
