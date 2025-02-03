const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const { ScriptRunner } = require('./utils/scriptRunner.js');
const { DatabaseOperationManager } = require('./utils/databaseOperationManager.js');
const { DataValidationManager } = require('./utils/dataValidationManager.js');
const { FileOperationManager } = require('./utils/fileOperationManager.js');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

// Verify MongoDB URI is available
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local file');
    console.log('Env file path:', envPath);
    console.log('Available env vars:', Object.keys(process.env));
    process.exit(1);
}

// Helper function to connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully');
        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Import categories after converting from ES module
const categoriesModule = require('../data/categories');
const categories = categoriesModule.categories || categoriesModule.default?.categories;

// Import Product model after converting from ES module
const ProductModule = require('../models/Product');
const getProductModel = ProductModule.default || ProductModule;

async function fixCategoryTaglines() {
    const script = new ScriptRunner({ name: 'Fix Category Taglines' });
    const dbManager = new DatabaseOperationManager();
    const validator = new DataValidationManager();
    const fileManager = new FileOperationManager();

    await script.execute(async () => {
        // Load and validate categories
        const categories = await fileManager.readJsonFile('categories.json', {
            validate: (data) => validator.validate('categories', data)
        });

        return dbManager.withCursor({
            model: getProductModel(),
            batchSize: 50,
            operation: async (product, session) => {
                const category = categories.find(c => c.slug === product.categorySlug);
                
                if (!category) {
                    return 'missing';
                }
                
                if (!product.categoryTagline || product.categoryTagline !== category.tagline) {
                    await getProductModel().findByIdAndUpdate(
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
                return 'skipped';
            }
        });
    });
}

fixCategoryTaglines(); 