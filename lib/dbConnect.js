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

// Increase EventEmitter max listeners for both mongoose connection and process
mongoose.connection.setMaxListeners(20);
process.setMaxListeners(20);

let cached = global.mongoose;
let handlersInitialized = false;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Initialize event handlers only once
const initializeHandlers = () => {
  if (!handlersInitialized) {
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

    // Clean up function to handle application shutdown
    const cleanup = async () => {
      try {
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
          console.log('MongoDB connection closed through app termination');
        }
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB cleanup:', err);
        process.exit(1);
      }
    };

    // Handle application termination (only add listeners once)
    process.once('SIGINT', cleanup);
    process.once('SIGTERM', cleanup);

    handlersInitialized = true;
  }
};

// Add connection pooling and retry logic
const connectWithRetry = async (retries = 5) => {
    try {
        if (cached.conn) {
            return cached.conn;
        }

        const opts = {
            bufferCommands: true,
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
            autoIndex: true,
            retryWrites: true,
            retryReads: true,
            connectTimeoutMS: 10000
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts);
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying database connection... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return connectWithRetry(retries - 1);
        }
        throw error;
    }
};

// Replace dbConnect with:
async function dbConnect() {
    try {
        initializeHandlers();
        return await connectWithRetry();
    } catch (error) {
        console.error('Fatal database connection error:', error);
        throw error;
    }
}

export default dbConnect;
