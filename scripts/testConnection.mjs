import { connect } from 'mongoose';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Use the full MONGODB_URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Using URI from environment variables');
    await connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    process.exit(0);
  }
}

testConnection(); 