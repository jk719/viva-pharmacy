import { ScriptRunner } from './utils/scriptRunner.js';
import { EnvironmentManager } from './utils/environmentManager.js';
import { DatabaseOperationManager } from './utils/databaseOperationManager.js';

async function fixPeptoSlug() {
    const script = new ScriptRunner({ name: 'Fix Pepto Slug' });
    const dbManager = new DatabaseOperationManager();
    const env = new EnvironmentManager();

    await script.execute(async () => {
        env.initialize();
        
        return dbManager.bulkOperation({
            model: Product,
            findCriteria: {
                name: "Pepto Bismol Maximum Strength Liquid 8oz",
                categorySlug: "digestive"
            },
            updateData: {
                categorySlug: "digestive-health",
                categoryTagline: "Happy Tummy"
            },
            options: {
                validateCategory: true
            }
        });
    });
}

fixPeptoSlug(); 