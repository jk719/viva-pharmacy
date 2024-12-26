import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import dbConnect from '../lib/dbConnect.js';
import Product from '../models/Product.js';

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

const migrateProducts = async () => {
  console.log('Connecting to database...');
  await dbConnect();
  
  try {
    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    
    // Log unique categories before migration
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    console.log('Categories found:', uniqueCategories);
    
    // Map products with Cloudinary URLs
    console.log('Mapping products with Cloudinary URLs...');
    const productsWithCloudinaryUrls = products.map(product => {
      const imageName = product.image.split('/').pop();
      const cloudinaryUrl = cloudinaryUrls[imageName];
      
      if (!cloudinaryUrl) {
        console.warn(`Warning: No Cloudinary URL found for ${imageName}`);
      }
      
      // Remove the id field as MongoDB will create its own _id
      const { id, ...productWithoutId } = product;
      
      return {
        ...productWithoutId,
        image: cloudinaryUrl || product.image
      };
    });
    
    // Insert products
    console.log(`Inserting ${productsWithCloudinaryUrls.length} products...`);
    await Product.insertMany(productsWithCloudinaryUrls);
    
    // Verify categories after migration
    const productsInDb = await Product.find({});
    const categoriesAfterMigration = [...new Set(productsInDb.map(p => p.category))];
    console.log('Categories after migration:', categoriesAfterMigration);
    
    console.log('Products migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit();
};

migrateProducts(); 