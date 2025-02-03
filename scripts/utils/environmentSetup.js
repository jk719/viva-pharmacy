import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { EnvironmentManager } from './environmentManager.js';

class EnvironmentSetup {
    constructor() {
        this.envManager = new EnvironmentManager();
    }

    async initialize() {
        // Load environment variables
        const envPath = path.resolve(__dirname, '../../.env.local');
        dotenv.config({ path: envPath });

        // Verify required environment variables
        const requiredVars = ['MONGODB_URI'];
        for (const varName of requiredVars) {
            if (!process.env[varName]) {
                throw new Error(`Required environment variable ${varName} is not defined`);
            }
        }

        // Initialize environment manager
        this.envManager.initialize();

        // Connect to database
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('MongoDB connected successfully');
            return mongoose.connection;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async cleanup() {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        }
    }
}

export default EnvironmentSetup; 