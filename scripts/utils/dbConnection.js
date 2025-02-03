import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

class DatabaseConnection {
    constructor() {
        this.connection = null;
        this.session = null;
    }

    async connect() {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        try {
            this.connection = await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 10000
            });
            console.log('MongoDB connected successfully');
            return this.connection;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async startSession() {
        if (!this.connection) {
            throw new Error('Database connection not established');
        }
        this.session = await mongoose.startSession();
        return this.session;
    }

    async cleanup() {
        if (this.session) {
            await this.session.endSession();
            this.session = null;
        }
        if (this.connection) {
            await mongoose.disconnect();
            this.connection = null;
        }
    }
}

export const db = new DatabaseConnection(); 