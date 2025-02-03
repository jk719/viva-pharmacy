import { ProgressLogger } from './progressLogger.js';
import { ResourceManager } from './resourceManager.js';
import { TransactionManager } from './transactionManager.js';

class BatchOperationManager {
    constructor(options = {}) {
        this.batchSize = options.batchSize || 50;
        this.resourceManager = new ResourceManager();
        this.transactionManager = new TransactionManager();
        this.progressLogger = null;
    }

    async executeBatchOperation({
        model,
        query = {},
        select = '',
        operation,
        totalItems,
        onProgress
    }) {
        return this.resourceManager.withResources(async () => {
            const total = totalItems || await model.countDocuments(query);
            this.progressLogger = new ProgressLogger({ totalItems: total, batchSize: this.batchSize });
            
            let processed = 0;
            while (processed < total) {
                await this.transactionManager.withTransaction(async (session) => {
                    const items = await model.find(query)
                        .skip(processed)
                        .limit(this.batchSize)
                        .select(select)
                        .session(session);

                    for (const item of items) {
                        try {
                            await operation(item, session);
                            this.progressLogger.update('updated');
                        } catch (error) {
                            console.error(`Error processing item ${item._id}:`, error);
                            this.progressLogger.update('errors');
                        }
                    }
                    
                    processed += items.length;
                    this.progressLogger.update('processed', items.length);
                    
                    if (onProgress) {
                        onProgress(this.progressLogger.getProgress());
                    }
                });
            }

            return this.progressLogger.getSummary();
        });
    }

    async executeParallelBatchOperation({
        model,
        query = {},
        operation,
        concurrency = 3
    }) {
        const total = await model.countDocuments(query);
        const batchCount = Math.ceil(total / this.batchSize);
        const batches = Array.from({ length: batchCount }, (_, i) => i);
        
        const progress = new ProgressLogger({ totalItems: total, batchSize: this.batchSize });
        
        await Promise.all(
            batches.map(async (batchIndex) => {
                const skip = batchIndex * this.batchSize;
                await this.transactionManager.withTransaction(async (session) => {
                    const items = await model.find(query)
                        .skip(skip)
                        .limit(this.batchSize)
                        .session(session);
                        
                    await operation(items, session, progress);
                });
            })
        );

        return progress.getSummary();
    }
}

export default BatchOperationManager; 