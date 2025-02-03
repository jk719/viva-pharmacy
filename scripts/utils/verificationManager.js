class VerificationManager {
    constructor(options = {}) {
        this.verifications = new Map();
        this.setupDefaultVerifications();
    }

    setupDefaultVerifications() {
        // Count verification
        this.addVerification('count', async ({ 
            model, 
            criteria, 
            expectedCount,
            session 
        }) => {
            const actualCount = await model.countDocuments(criteria).session(session);
            if (actualCount !== expectedCount) {
                throw new Error(
                    `Count verification failed: expected ${expectedCount} but found ${actualCount}`
                );
            }
            return true;
        });

        // Data integrity verification
        this.addVerification('integrity', async ({
            model,
            criteria,
            verifyFn,
            session
        }) => {
            const documents = await model.find(criteria).session(session);
            const errors = [];

            for (const doc of documents) {
                try {
                    await verifyFn(doc);
                } catch (error) {
                    errors.push(`${doc._id}: ${error.message}`);
                }
            }

            if (errors.length > 0) {
                throw new Error('Data integrity verification failed:\n' + errors.join('\n'));
            }
            return true;
        });

        // Category verification
        this.addVerification('category', async ({
            model,
            categories,
            session
        }) => {
            const documents = await model.find({})
                .select('categorySlug')
                .session(session);

            const invalidCategories = documents.filter(doc => 
                !categories.some(c => c.slug === doc.categorySlug)
            );

            if (invalidCategories.length > 0) {
                throw new Error(
                    `Invalid categories found:\n${
                        invalidCategories.map(doc => doc.categorySlug).join('\n')
                    }`
                );
            }
            return true;
        });
    }

    addVerification(name, verifyFn) {
        this.verifications.set(name, verifyFn);
    }

    async verify(name, data) {
        const verification = this.verifications.get(name);
        if (!verification) {
            throw new Error(`No verification found for: ${name}`);
        }
        return verification(data);
    }

    async verifyAll(verifications) {
        const errors = [];
        
        for (const [name, data] of Object.entries(verifications)) {
            try {
                await this.verify(name, data);
            } catch (error) {
                errors.push({ name, error: error.message });
            }
        }
        
        if (errors.length > 0) {
            throw new Error('Verifications failed:\n' + 
                errors.map(e => `- ${e.name}: ${e.error}`).join('\n'));
        }
        return true;
    }
}

export default VerificationManager; 