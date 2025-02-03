const mongoose = require('mongoose');
const { createDbConnection } = require('./dbConfig');

async function performBatchOperation({
    query,
    batchSize = 50,
    operation,
    validate = true
}) {
    let connection;
    let session;
    
    try {
        connection = await createDbConnection();
        const totalDocuments = await query.countDocuments();
        console.log(`Found ${totalDocuments} documents to process`);

        let processed = 0;
        let updated = 0;
        let errors = 0;

        while (processed < totalDocuments) {
            session = await mongoose.startSession();
            try {
                await session.withTransaction(async () => {
                    const batch = await query
                        .skip(processed)
                        .limit(batchSize)
                        .session(session);

                    for (const doc of batch) {
                        try {
                            await operation(doc, session);
                            updated++;
                        } catch (error) {
                            console.error(`Error processing document ${doc._id}:`, error);
                            errors++;
                        }
                    }
                });
            } finally {
                await session.endSession();
            }

            processed += batchSize;
            console.log(`Progress: ${processed}/${totalDocuments} (${Math.round(processed/totalDocuments*100)}%)`);
        }

        return { updated, errors };
    } finally {
        if (connection) await connection.close();
    }
}

module.exports = { performBatchOperation }; 