import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createDbConnection } from './utils/dbConfig';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import products directly
import { products } from '../data/products.js';

// Read cloudinaryUrls.json
const cloudinaryUrls = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'data/cloudinaryUrls.json'),
    'utf8'
  )
);

async function migrateProducts() {
    let connection;
    let session;
    
    try {
        // Validate input data
        if (!Array.isArray(products) || products.length === 0) {
            throw new Error('Products data is invalid or empty');
        }
        if (!cloudinaryUrls || typeof cloudinaryUrls !== 'object') {
            throw new Error('Invalid Cloudinary URLs data');
        }

        connection = await createDbConnection();
        session = await mongoose.startSession();
        
        await session.withTransaction(async () => {
            const productsWithCloudinaryUrls = products.map(product => {
                const cloudinaryUrl = findCloudinaryUrl(product.name, cloudinaryUrls);
                if (!cloudinaryUrl) {
                    console.warn(`No Cloudinary URL found for: ${product.name}`);
                }
                
                const { id, ...productWithoutId } = product;
                return {
                    ...productWithoutId,
                    image: cloudinaryUrl || product.image,
                    updatedAt: new Date(),
                    createdAt: new Date()
                };
            });
            
            // Insert in batches for better memory management
            const BATCH_SIZE = 50;
            let inserted = 0;
            let errors = 0;
            
            for (let i = 0; i < productsWithCloudinaryUrls.length; i += BATCH_SIZE) {
                const batch = productsWithCloudinaryUrls.slice(i, i + BATCH_SIZE);
                try {
                    const result = await Product.insertMany(batch, {
                        ordered: false,
                        session,
                        timeout: 30000
                    });
                    inserted += result.length;
                    console.log(`Progress: ${inserted}/${productsWithCloudinaryUrls.length} products inserted`);
                } catch (error) {
                    console.error(`Error inserting batch ${i/BATCH_SIZE + 1}:`, error);
                    errors++;
                }
            }
            
            console.log('\nMigration summary:');
            console.log(`- Inserted: ${inserted} products`);
            console.log(`- Failed batches: ${errors}`);
        });
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exitCode = 1;
    } finally {
        if (session) await session.endSession();
        if (connection) await connection.close();
        process.exit(process.exitCode || 0);
    }
}

migrateProducts(); 