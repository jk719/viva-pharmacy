import { ScriptRunner } from './utils/scriptRunner.js';
import { DatabaseOperationManager } from './utils/databaseOperationManager.js';
import { VerificationManager } from './utils/verificationManager.js';

async function updateChildrensCategory() {
    const script = new ScriptRunner({ name: 'Update Children\'s Category' });
    const dbManager = new DatabaseOperationManager();
    const verifier = new VerificationManager();

    await script.execute(async () => {
        return dbManager.bulkOperation({
            model: Product,
            findCriteria: { categorySlug: "childrens-wellness" },
            updateData: {
                category: "Children's Medicine & Wellness",
                categorySlug: "childrens-medicine-wellness",
                categoryTagline: "Children's Care",
                updatedAt: new Date()
            },
            options: {
                verifyUpdate: async (result, session) => {
                    await verifier.verify('count', {
                        model: Product,
                        criteria: { categorySlug: "childrens-medicine-wellness" },
                        expectedCount: result.modifiedCount,
                        session
                    });
                }
            }
        });
    });
}

updateChildrensCategory(); 