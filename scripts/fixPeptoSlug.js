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

async function fixPeptoSlug() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully');
        
        // Import Product model after converting from ES module
        const ProductModule = require('../models/Product');
        const getProductModel = ProductModule.default || ProductModule;
        const Product = getProductModel();
        
        const result = await Product.findOneAndUpdate(
            { 
                name: "Pepto Bismol Maximum Strength Liquid 8oz",
                categorySlug: "digestive"
            },
            {
                $set: {
                    categorySlug: "digestive-health",
                    categoryTagline: "Happy Tummy"
                }
            },
            { new: true }
        );
        
        if (result) {
            console.log('Successfully updated Pepto Bismol product:');
            console.log('- New category slug:', result.categorySlug);
            console.log('- New tagline:', result.categoryTagline);
        } else {
            console.log('Product not found');
        }
        
    } catch (error) {
        console.error('Error fixing Pepto Bismol slug:', error);
    } finally {
        await mongoose.connection.close();
    }
}

fixPeptoSlug(); 