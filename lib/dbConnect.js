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

// Increase EventEmitter max listeners
mongoose.connection.setMaxListeners(15);

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
        family: 4, // Use IPv4, skip trying IPv6
        autoIndex: true, // Build indexes
        retryWrites: true,
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        heartbeatFrequencyMS: 30000, // Check connection every 30 seconds
      };

      console.log('Creating new database connection');
      cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
      cached.conn = await cached.promise;
      
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

// Clean up function to handle application shutdown
const cleanup = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB cleanup:', err);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Handle application termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

export default dbConnect;
