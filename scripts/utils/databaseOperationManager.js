import mongoose from 'mongoose';
import { ResourceManager } from './resourceManager.js';
import { TransactionManager } from './transactionManager.js';
import { ProgressLogger } from './progressLogger.js';

class DatabaseOperationManager {
    constructor(options = {}) {
        this.resourceManager = new ResourceManager();
        this.transactionManager = new TransactionManager();
        this.defaultBatchSize = options.batchSize || 50;
    }

    async withCursor({
        model,
        query = {},
        batchSize = this.defaultBatchSize,
        select = '',
        operation,
        onProgress
    }) {
        return this.resourceManager.withResources(async () => {
            const totalCount = await model.countDocuments(query);
            const progress = new ProgressLogger({ totalItems: totalCount, batchSize });
            
            await this.transactionManager.withTransaction(async (session) => {
                const cursor = model.find(query)
                    .select(select)
                    .session(session)
                    .cursor({ batchSize });

                for await (const document of cursor) {
                    try {
                        await operation(document, session);
                        progress.update('updated');
                    } catch (error) {
                        console.error(`Error processing document ${document._id}:`, error);
                        progress.update('errors');
                    }
                    progress.update('processed');
                    
                    if (onProgress) {
                        onProgress(progress.getProgress());
                    }
                }
            });

            return progress.getSummary();
        });
    }

    async withBatches({
        model,
        query = {},
        batchSize = this.defaultBatchSize,
        select = '',
        operation,
        onProgress
    }) {
        return this.resourceManager.withResources(async () => {
            const totalCount = await model.countDocuments(query);
            const progress = new ProgressLogger({ totalItems: totalCount, batchSize });
            let processed = 0;

            while (processed < totalCount) {
                await this.transactionManager.withTransaction(async (session) => {
                    const documents = await model.find(query)
                        .skip(processed)
                        .limit(batchSize)
                        .select(select)
                        .session(session);

                    for (const document of documents) {
                        try {
                            await operation(document, session);
                            progress.update('updated');
                        } catch (error) {
                            console.error(`Error processing document ${document._id}:`, error);
                            progress.update('errors');
                        }
                    }
                });

                processed += batchSize;
                progress.update('processed', batchSize);
                
                if (onProgress) {
                    onProgress(progress.getProgress());
                }
            }

            return progress.getSummary();
        });
    }

    async bulkOperation({
        model,
        findCriteria,
        updateData,
        options = {}
    }) {
        return this.resourceManager.withResources(async () => {
            return this.transactionManager.withTransaction(async (session) => {
                const result = await model.updateMany(
                    findCriteria,
                    updateData,
                    { 
                        session, 
                        runValidators: true,
                        ...options 
                    }
                );

                return {
                    matched: result.matchedCount,
                    modified: result.modifiedCount
                };
            });
        });
    }
}

export default DatabaseOperationManager; 