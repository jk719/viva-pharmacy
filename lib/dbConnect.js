// src/lib/dbConnect.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  try {
    // If we have a connection, return it
    if (cached.conn) {
      console.log('Using existing database connection');
      return cached.conn;
    }

    // If we don't have a promise to connect, create one
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      console.log('Creating new database connection');
      cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
      cached.conn = await cached.promise;
      console.log('Database connected successfully');
      
      // Log connection status
      const state = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };
      console.log(`MongoDB connection state: ${states[state]}`);
      
    } catch (e) {
      cached.promise = null;
      console.error('MongoDB connection error:', e);
      throw new Error('Failed to connect to database');
    }

    return cached.conn;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

export default dbConnect;
