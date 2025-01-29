const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local file');
    process.exit(1);
}

async function updateChildrensCategory() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully');
        
        const ProductModule = require('../models/Product');
        const getProductModel = ProductModule.default || ProductModule;
        const Product = getProductModel();
        
        // Find any products using the old category
        const productsToUpdate = await Product.find({ 
            categorySlug: "childrens-wellness"
        });
        
        console.log(`Found ${productsToUpdate.length} products to update`);
        
        // Update products to use the consolidated category
        if (productsToUpdate.length > 0) {
            const result = await Product.updateMany(
                { categorySlug: "childrens-wellness" },
                { 
                    $set: {
                        category: "Children's Medicine & Wellness",
                        categorySlug: "childrens-medicine-wellness",
                        categoryTagline: "Children's Care"
                    }
                }
            );
            
            console.log('Update results:', {
                matched: result.matchedCount,
                modified: result.modifiedCount
            });
        }
        
        console.log('Category consolidation complete');
        
    } catch (error) {
        console.error('Error updating children\'s category:', error);
    } finally {
        await mongoose.connection.close();
    }
}

updateChildrensCategory(); 