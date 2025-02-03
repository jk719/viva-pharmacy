import { ScriptRunner } from './utils/scriptRunner.js';
import { DatabaseOperationManager } from './utils/databaseOperationManager.js';
import { DataValidationManager } from './utils/dataValidationManager.js';
import { FileOperationManager } from './utils/fileOperationManager.js';
import { generateSlug } from '../utils/slugs.js';
import { connectToDatabase } from '../lib/dbConnect';
import Product from '../models/Product';
import { categories } from '../data/categories';
import mongoose from 'mongoose';

// Category mappings could be moved to a JSON file
const categoryMappings = {
    'Monistat 3 Vaginal Antifungal': {
        category: 'Medications',
        subcategory: 'Women\'s Health',
        item: 'Antifungal'
    },
    'NeilMed Sinus Rinse': {
        category: 'Medications',
        subcategory: 'Cold & Flu',
        item: 'Nasal Care'
    },
    'BAND-AID': {
        category: 'First Aid',
        subcategory: 'Wound Care',
        item: 'Bandages'
    }
};

async function updateCategories() {
    const script = new ScriptRunner({ name: 'Update Categories' });
    const dbManager = new DatabaseOperationManager();
    const validator = new DataValidationManager();
    const fileManager = new FileOperationManager();

    await script.execute(async () => {
        // Validate mappings
        await validator.validate('categoryMappings', categoryMappings);

        return dbManager.withCursor({
            model: Product,
            batchSize: 50,
            operation: async (product, session) => {
                const mapping = findMapping(product.name, categoryMappings);
                
                if (!mapping) {
                    return 'skipped';
                }

                await Product.updateOne(
                    { _id: product._id },
                    {
                        $set: {
                            category: mapping.category,
                            subcategory: mapping.subcategory,
                            item: mapping.item,
                            categorySlug: generateSlug(mapping.category),
                            subcategorySlug: generateSlug(mapping.subcategory),
                            itemSlug: generateSlug(mapping.item),
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

updateCategories(); 