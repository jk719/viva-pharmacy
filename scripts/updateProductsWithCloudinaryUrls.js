import dbConnect from '../lib/dbConnect.js';
import getProductModel from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateProductsWithCloudinaryUrls() {
  try {
    // Read the Cloudinary URLs file
    const cloudinaryUrlsPath = path.join(__dirname, '..', 'data', 'cloudinaryUrls.json');
    const cloudinaryUrls = JSON.parse(fs.readFileSync(cloudinaryUrlsPath, 'utf8'));
    
    // Create a map for easy lookup
    const urlMap = new Map(
      cloudinaryUrls.map(item => [
        path.basename(item.public_id), // Get the filename without extension
        {
          url: item.url,
          public_id: item.public_id
        }
      ])
    );

    // Connect to MongoDB
    await dbConnect();
    const Product = getProductModel();
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to process`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const product of products) {
      // Get base filename without extension
      const imageKey = product.imageKey ? 
        path.basename(product.imageKey, path.extname(product.imageKey)) : null;
      
      if (!imageKey) {
        console.log(`Skipping ${product.name} - no image key`);
        skipped++;
        continue;
      }
      
      const cloudinaryData = urlMap.get(imageKey);
      
      if (cloudinaryData) {
        await Product.findByIdAndUpdate(product._id, {
          $set: {
            imageUrl: cloudinaryData.url,
            cloudinaryPublicId: cloudinaryData.public_id
          }
        });
        console.log(`✅ Updated ${product.name} with Cloudinary URL`);
        updated++;
      } else {
        console.log(`❌ No Cloudinary URL found for ${product.name} (${imageKey})`);
        skipped++;
      }
    }
    
    console.log('\nUpdate Summary:');
    console.log(`Total products: ${products.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    process.exit();
  }
}

updateProductsWithCloudinaryUrls(); 