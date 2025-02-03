import { ScriptRunner } from './utils/scriptRunner.js';
import { DatabaseOperationManager } from './utils/databaseOperationManager.js';
import { DataValidationManager } from './utils/dataValidationManager.js';
import { FileOperationManager } from './utils/fileOperationManager.js';

async function updateCategoryTaglines() {
    const script = new ScriptRunner({ name: 'Update Category Taglines' });
    const dbManager = new DatabaseOperationManager();
    const validator = new DataValidationManager();
    const fileManager = new FileOperationManager();

    await script.execute(async () => {
        // Load and validate categories
        const categories = await fileManager.readJsonFile('categories.json', {
            validate: (data) => validator.validate('categories', data)
        });

        return dbManager.withCursor({
            model: Product,
            batchSize: 100,
            operation: async (product, session) => {
                const category = categories.find(c => c.slug === product.categorySlug);
                if (!category || category.tagline === product.categoryTagline) {
                    return 'skipped';
                }

                await Product.findByIdAndUpdate(
                    product._id,
                    {
                        $set: {
                            categoryTagline: category.tagline,
                            updatedAt: new Date()
                        }
                    },
                    { session, runValidators: true }
                );
                return 'updated';
            }
        });
    });
}

updateCategoryTaglines(); 