import { promises as fs } from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { ScriptRunner } from './utils/scriptRunner.js';
import { DatabaseOperationManager } from './utils/databaseOperationManager.js';
import { SessionManager } from './utils/sessionManager.js';
import { FileOperationManager } from './utils/fileOperationManager.js';

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
    const script = new ScriptRunner({ name: 'Update Product Images' });
    const dbManager = new DatabaseOperationManager();
    const sessionManager = new SessionManager();
    const fileManager = new FileOperationManager();

    await script.execute(async () => {
        // Load and validate Cloudinary URLs
        const cloudinaryUrls = await fileManager.readJsonFile('cloudinaryUrls.json', {
            validate: (data) => {
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid Cloudinary URLs data structure');
                }
            }
        });

        return sessionManager.withSession(async (session) => {
            return dbManager.withCursor({
                model: Product,
                session,
                batchSize: 50,
                select: '_id name image',
                operation: async (product, session) => {
                    const cloudinaryUrl = findMatchingUrl(product.name, cloudinaryUrls);
                    if (cloudinaryUrl && cloudinaryUrl !== product.image) {
                        await Product.findByIdAndUpdate(
                            product._id,
                            {
                                $set: {
                                    image: cloudinaryUrl,
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
    });
}

// Run the migration
updateProductImages(); 