import { promises as fs } from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection function
async function dbConnect() {
    if (!process.env.MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    image: String,
    category: String,
    isFeatured: Boolean,
    stock: Number,
    sku: String,
    dosageForm: String,
    activeIngredients: [{ name: String, amount: String }],
    warnings: [String],
    directions: String,
    createdBy: mongoose.Schema.Types.ObjectId
}, {
    timestamps: true
});

// Create Product model
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Helper function to normalize product names for comparison
function normalizeProductName(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
        .trim();
}

// Helper function to find matching Cloudinary URL
function findMatchingUrl(productName, cloudinaryUrls) {
    const normalizedProductName = normalizeProductName(productName);
    
    // Create a map of normalized names to original filenames
    const normalizedMap = Object.keys(cloudinaryUrls).reduce((acc, filename) => {
        const nameWithoutExtension = filename.replace(/\.(png|jpg|jpeg|svg)$/, '');
        const normalized = normalizeProductName(nameWithoutExtension);
        acc[normalized] = filename;
        return acc;
    }, {});

    // Find matching filename
    const matchingFilename = normalizedMap[normalizedProductName];
    return matchingFilename ? cloudinaryUrls[matchingFilename] : null;
}

async function updateProductImages() {
    try {
        // Connect to database
        await dbConnect();

        // Read cloudinaryUrls.json
        const cloudinaryUrls = JSON.parse(
            await fs.readFile(path.join(process.cwd(), 'data/cloudinaryUrls.json'), 'utf8')
        );
        console.log(`Loaded ${Object.keys(cloudinaryUrls).length} Cloudinary URLs`);

        // Get all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products to update`);

        let updatedCount = 0;
        let skippedCount = 0;

        // Update each product
        for (const product of products) {
            const cloudinaryUrl = findMatchingUrl(product.name, cloudinaryUrls);

            if (cloudinaryUrl) {
                await Product.findByIdAndUpdate(product._id, { image: cloudinaryUrl });
                console.log(`Updated product: ${product.name}`);
                console.log(`New URL: ${cloudinaryUrl}`);
                updatedCount++;
            } else {
                console.log(`No matching URL found for: ${product.name}`);
                console.log(`Current image: ${product.image}`);
                skippedCount++;
            }
        }

        console.log('\nMigration complete:');
        console.log(`- Updated: ${updatedCount} products`);
        console.log(`- Skipped: ${skippedCount} products`);

    } catch (error) {
        console.error('Error updating product images:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

// Run the migration
updateProductImages(); 