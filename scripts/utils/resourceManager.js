import mongoose from 'mongoose';
import { TransactionManager } from './transactionManager.js';

class ResourceManager {
    constructor() {
        this.connection = null;
        this.transactionManager = new TransactionManager();
        this.resources = new Set();
    }

    async initialize(options = {}) {
        const {
            uri = process.env.MONGODB_URI,
            validateEnv = true,
            connectTimeout = 10000
        } = options;

        if (validateEnv && !uri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        try {
            this.connection = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: connectTimeout
            });
            console.log('MongoDB connected successfully');
        } catch (error) {
            console.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    register(resource) {
        this.resources.add(resource);
    }

    async cleanup() {
        try {
            // Clean up registered resources
            for (const resource of this.resources) {
                if (typeof resource.cleanup === 'function') {
                    await resource.cleanup();
                }
            }

            // Close database connection
            if (this.connection) {
                await mongoose.disconnect();
                this.connection = null;
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
            throw error;
        } finally {
            this.resources.clear();
        }
    }

    async withResources(callback) {
        try {
            await this.initialize();
            return await callback(this);
        } finally {
            await this.cleanup();
        }
    }
}

export default ResourceManager; 