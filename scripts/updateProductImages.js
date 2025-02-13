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
        // Read the Cloudinary matches
        const matchesPath = path.join(__dirname, '..', 'data', 'cloudinaryMatches.json');
        const matches = JSON.parse(await fs.readFile(matchesPath, 'utf8'));

        // Track updates
        let updatedCount = 0;
        let skippedCount = 0;
        const skippedProducts = [];
        const updatedProducts = [];

        // Connect to MongoDB and get Product model
        await dbConnect();
        const Product = getProductModel();

        console.log('Updating MongoDB products...');

        const dbProducts = await Product.find({});
        for (const product of dbProducts) {
            const normalizedName = normalizeProductName(product.name);
            
            // Find matching Cloudinary URL
            const matchingEntry = Object.entries(matches).find(([filename]) => 
                normalizeProductName(filename.replace(/\.(png|jpg|jpeg)$/, ''))
                === normalizedName
            );

            if (matchingEntry) {
                const [, match] = matchingEntry;
                // Extract the image key from the Cloudinary URL
                const imageKey = match.originalName.split('/').pop(); // Gets the last part of the path
                
                if (product.imageKey !== imageKey) {
                    try {
                        await Product.findByIdAndUpdate(
                            product._id,
                            {
                                $set: {
                                    imageKey: imageKey
                                }
                            },
                            { runValidators: true }
                        );
                        updatedCount++;
                        updatedProducts.push({
                            name: product.name,
                            oldImageKey: product.imageKey,
                            newImageKey: imageKey
                        });
                    } catch (error) {
                        console.error(`Error updating product ${product.name}:`, error);
                        skippedCount++;
                        skippedProducts.push({
                            name: product.name,
                            error: error.message
                        });
                    }
                }
            } else {
                skippedCount++;
                skippedProducts.push({
                    name: product.name,
                    reason: 'No matching Cloudinary image found'
                });
            }
        }

        // Print summary
        console.log('\nUpdate Summary:');
        console.log(`Updated: ${updatedCount} products`);
        console.log(`Skipped: ${skippedCount} products`);
        
        if (updatedProducts.length > 0) {
            console.log('\nUpdated Products:');
            updatedProducts.forEach(({ name, oldImageKey, newImageKey }) => {
                console.log(`- ${name}`);
                console.log(`  Old imageKey: ${oldImageKey}`);
                console.log(`  New imageKey: ${newImageKey}`);
            });
        }
        
        if (skippedProducts.length > 0) {
            console.log('\nSkipped Products:');
            skippedProducts.forEach(({ name, reason, error }) => {
                console.log(`- ${name}`);
                console.log(`  Reason: ${reason || error}`);
            });
        }

        await mongoose.disconnect();
        console.log('MongoDB disconnected');

    } catch (error) {
        console.error('Error:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

updateProductImages(); 