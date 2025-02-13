import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local file');
    process.exit(1);
}

export async function createDbConnection() {
    const connection = await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
    });
    console.log('MongoDB connected successfully');
    return connection;
}

export { MONGODB_URI }; 