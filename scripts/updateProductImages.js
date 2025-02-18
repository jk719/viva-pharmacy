// Add server-side check at the top
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

import { promises as fs } from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import getProductModel from '../models/Product.js';
import dbConnect from '../lib/dbConnect';
import { getCloudinaryUrl } from '../lib/cloudinary';

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

// Helper function to normalize product names for comparison
function normalizeProductName(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
        .trim();
}

async function updateProductImages() {
    try {
        await dbConnect();
        const Product = getProductModel();
        const products = await Product.find({});
        
        for (const product of products) {
            if (product.cloudinaryPublicId) {
                const imageUrl = getCloudinaryUrl(product.cloudinaryPublicId);
                await Product.updateOne(
                    { _id: product._id },
                    { 
                        $set: { 
                            imageUrl: imageUrl,
                            'seo.structuredData.image': imageUrl
                        }
                    }
                );
            }
        }
        
        console.log('Product images updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error updating product images:', error);
        process.exit(1);
    }
}

updateProductImages(); 