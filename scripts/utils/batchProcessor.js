import ProgressTracker from './progressTracker.js';
import { db } from './dbConnection.js';

class BatchProcessor {
    constructor(options = {}) {
        this.batchSize = options.batchSize || 50;
        this.timeout = options.timeout || 30000;
        this.validator = options.validator;
    }

    async processBatch({ 
        query, 
        processor, 
        onProgress = () => {}, 
        validate = true 
    }) {
        let session;
        
        try {
            await db.connect();
            const totalCount = await query.countDocuments();
            const progress = new ProgressTracker(totalCount, this.batchSize);
            
            session = await db.startSession();
            
            await session.withTransaction(async () => {
                const cursor = query
                    .session(session)
                    .cursor({ batchSize: this.batchSize });
                
                for await (const doc of cursor) {
                    try {
                        if (validate && this.validator) {
                            await this.validator.validate(doc);
                        }
                        
                        await processor(doc, session);
                        progress.increment('updated');
                    } catch (error) {
                        console.error(`Error processing document ${doc._id}:`, error);
                        progress.increment('error');
                    }
                    
                    progress.increment('processed');
                    onProgress(progress.getProgress());
                }
            });
            
            return progress.getSummary();
        } finally {
            if (session) await session.endSession();
            await db.cleanup();
        }
    }
}

export default BatchProcessor; 