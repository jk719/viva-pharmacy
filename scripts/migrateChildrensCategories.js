import { ScriptRunner } from './utils/scriptRunner.js';
import { DatabaseOperationManager } from './utils/databaseOperationManager.js';
import { SessionManager } from './utils/sessionManager.js';
const { default: getProductModel } = require('../models/Product');

async function migrateChildrensCategories() {
    const script = new ScriptRunner({ name: 'Migrate Children\'s Categories' });
    const dbManager = new DatabaseOperationManager();
    const sessionManager = new SessionManager();
    const Product = getProductModel();

    await script.execute(async () => {
        return sessionManager.withSession(async (session) => {
            const products = await Product.find({ 
                categorySlug: "childrens-wellness"
            })
            .select('_id name categorySlug')
            .session(session);

            console.log(`Found ${products.length} products to migrate`);

            if (products.length === 0) {
                return { matched: 0, modified: 0 };
            }

            return dbManager.bulkOperation({
                model: Product,
                findCriteria: { categorySlug: "childrens-wellness" },
                updateData: {
                    category: "Children's Medicine & Wellness",
                    categorySlug: "childrens-medicine-wellness",
                    categoryTagline: "Children's Care"
                },
                options: { session }
            });
        });
    });
}

migrateChildrensCategories(); 