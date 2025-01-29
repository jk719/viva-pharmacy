const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

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
    try {
        await connectDB();
        const Product = getProductModel();
        
        const products = await Product.find({});
        console.log(`Found ${products.length} products to check`);
        
        // Debug: Print first product
        if (products[0]) {
            console.log('\nFirst product sample:');
            console.log(JSON.stringify(products[0], null, 2));
        }
        
        // Debug: Print available categories
        console.log('\nAvailable Categories:');
        categories.forEach(cat => {
            console.log(`- ${cat.name} (slug: ${cat.slug}, tagline: "${cat.tagline}")`);
        });
        
        let updated = 0;
        let missing = 0;
        
        for (const product of products) {
            console.log(`\nChecking product: ${product.name}`);
            console.log(`  Category Slug: ${product.categorySlug}`);
            console.log(`  Current tagline: ${product.categoryTagline || 'none'}`);
            
            const category = categories.find(c => c.slug === product.categorySlug);
            if (!category) {
                console.log(`  Warning: No category found for product ${product.name} (slug: ${product.categorySlug})`);
                missing++;
                continue;
            }
            
            console.log(`  Found category: ${category.name} (tagline: "${category.tagline}")`);
            
            if (!product.categoryTagline || product.categoryTagline !== category.tagline) {
                console.log(`  Updating tagline:`);
                console.log(`    From: ${product.categoryTagline || 'none'}`);
                console.log(`    To: ${category.tagline}`);
                
                await Product.findByIdAndUpdate(product._id, {
                    $set: { categoryTagline: category.tagline }
                });
                updated++;
            } else {
                console.log('  Tagline is already correct');
            }
        }
        
        console.log('\nSummary:');
        console.log(`Total products: ${products.length}`);
        console.log(`Updated: ${updated}`);
        console.log(`Missing categories: ${missing}`);
        
    } catch (error) {
        console.error('Error fixing category taglines:', error);
    } finally {
        await mongoose.connection.close();
    }
}

fixCategoryTaglines(); 