import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '../lib/dbConnect.js';
import getProductModel from '../models/Product.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkUrl(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function checkBrowserUrls() {
  try {
    await dbConnect();
    const Product = await getProductModel();
    const products = await Product.find({});
    
    console.log(`Checking ${products.length} products\n`);
    let failedUrls = 0;

    for (const product of products) {
      if (product.imageUrl) {
        const isAccessible = await checkUrl(product.imageUrl);
        
        if (!isAccessible) {
          console.log(`❌ Failed URL for ${product.name}:`);
          console.log(`URL: ${product.imageUrl}`);
          console.log(`Public ID: ${product.cloudinaryPublicId || 'Not set'}\n`);
          failedUrls++;
          
          // Try to get the correct URL from Cloudinary
          try {
            const result = await cloudinary.api.resource(product.cloudinaryPublicId);
            console.log(`✅ Correct Cloudinary URL should be: ${result.secure_url}\n`);
            
            // Update the product with the correct URL
            await Product.updateOne(
              { _id: product._id },
              { imageUrl: result.secure_url }
            );
            console.log(`Updated database with correct URL\n`);
          } catch (cloudinaryError) {
            console.log(`⚠️ Could not find image in Cloudinary: ${cloudinaryError.message}\n`);
          }
        }
      }
    }

    console.log(`\nCheck complete`);
    console.log(`Total products: ${products.length}`);
    console.log(`Failed URLs: ${failedUrls}`);

  } catch (error) {
    console.error('Check failed:', error);
  } finally {
    process.exit();
  }
}

checkBrowserUrls(); 