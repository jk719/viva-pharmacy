import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '../lib/dbConnect.js';
import getProductModel from '../models/Product.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function verifyCloudinaryUrls() {
  try {
    await dbConnect();
    const Product = await getProductModel();
    const products = await Product.find({});
    
    console.log(`Found ${products.length} products`);
    let invalidUrls = 0;

    for (const product of products) {
      if (product.imageUrl) {
        try {
          // Extract public ID from URL
          const urlParts = product.imageUrl.split('/');
          const filename = urlParts[urlParts.length - 1].split('.')[0];
          
          // Verify image exists in Cloudinary
          const result = await cloudinary.api.resource(product.cloudinaryPublicId || filename);
          
          if (result.secure_url !== product.imageUrl) {
            console.log(`Mismatch for ${product.name}:`);
            console.log(`DB URL: ${product.imageUrl}`);
            console.log(`Actual URL: ${result.secure_url}`);
            
            // Update product with correct URL
            await Product.updateOne(
              { _id: product._id },
              { 
                imageUrl: result.secure_url,
                cloudinaryPublicId: result.public_id
              }
            );
            console.log('Updated with correct URL\n');
          }
        } catch (error) {
          console.log(`Invalid URL for ${product.name}: ${product.imageUrl}`);
          invalidUrls++;
        }
      }
    }

    console.log(`\nVerification complete`);
    console.log(`Total products: ${products.length}`);
    console.log(`Invalid URLs found: ${invalidUrls}`);

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    process.exit();
  }
}

verifyCloudinaryUrls(); 