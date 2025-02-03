import mongoose from 'mongoose';

class SessionManager {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
    }

    async withSession(operation) {
        let session = null;
        let attempt = 0;

        while (attempt < this.maxRetries) {
            try {
                session = await mongoose.startSession();
                return await session.withTransaction(() => operation(session));
            } catch (error) {
                attempt++;
                if (attempt === this.maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            } finally {
                if (session) {
                    await session.endSession();
                }
            }
        }
    }

    async withBatchSession(operation, options = {}) {
        const {
            batchSize = 50,
            progressCallback
        } = options;

        return this.withSession(async (session) => {
            let currentBatch = 0;
            let results = [];

            while (true) {
                const batchResult = await operation(session, currentBatch, batchSize);
                if (!batchResult || batchResult.length === 0) break;

                results.push(...batchResult);
                currentBatch++;

                if (progressCallback) {
                    progressCallback(results.length, currentBatch * batchSize);
                }
            }

            return results;
        });
    }
}

export default SessionManager; 