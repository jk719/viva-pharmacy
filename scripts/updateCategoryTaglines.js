const connectDB = require('./db');
const getProductModel = require('../models/Product').default;
const { categories } = require('../data/categories');
const mongoose = require('mongoose');

async function updateCategoryTaglines() {
    try {
        await connectDB();
        const Product = getProductModel();
        
        const products = await Product.find({});
        console.log(`Found ${products.length} products to update`);
        
        let updated = 0;
        
        for (const product of products) {
            const category = categories.find(c => c.slug === product.categorySlug);
            if (category && category.tagline !== product.categoryTagline) {
                await Product.findByIdAndUpdate(product._id, {
                    categoryTagline: category.tagline
                });
                updated++;
                console.log(`Updated product: ${product.name}`);
            }
        }
        
        console.log(`Updated ${updated} products with category taglines`);
    } catch (error) {
        console.error('Error updating category taglines:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

updateCategoryTaglines(); 