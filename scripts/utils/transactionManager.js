import mongoose from 'mongoose';
import { db } from './dbConnection.js';

class TransactionManager {
    constructor() {
        this.session = null;
    }

    async withTransaction(callback, options = {}) {
        const { 
            retryCount = 3,
            timeout = 30000
        } = options;

        try {
            this.session = await mongoose.startSession();
            let attempt = 0;
            let lastError;

            while (attempt < retryCount) {
                try {
                    const result = await this.session.withTransaction(
                        async () => await callback(this.session),
                        { 
                            maxTimeMS: timeout,
                            readConcern: { level: 'snapshot' },
                            writeConcern: { w: 'majority' }
                        }
                    );
                    return result;
                } catch (error) {
                    lastError = error;
                    if (!this.isTransientError(error)) {
                        throw error;
                    }
                    attempt++;
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
            throw lastError;
        } finally {
            if (this.session) {
                await this.session.endSession();
                this.session = null;
            }
        }
    }

    isTransientError(error) {
        const transientErrors = [
            'WriteConflict',
            'TransactionAborted',
            'NoSuchTransaction'
        ];
        return transientErrors.some(code => error.message.includes(code));
    }
}

export default TransactionManager; 