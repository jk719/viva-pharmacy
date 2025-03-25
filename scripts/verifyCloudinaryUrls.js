import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '../lib/dbConnect.js';
import getProductModel from '../models/Product.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Use the correct environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function verifyCloudinaryUrls() {
  try {
    await dbConnect();
    const Product = await getProductModel();
    const products = await Product.find({});
    
    console.log(`Found ${products.length} products`);
    console.log('Fetching all Cloudinary resources...');

    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'viva-pharmacy-online-store',
      max_results: 500
    });

    // Create a map of public_ids to secure_urls
    const cloudinaryUrls = new Map(
      resources.resources.map(resource => [resource.public_id, resource.secure_url])
    );

    let invalidUrls = 0;
    let updatedProducts = 0;

    for (const product of products) {
      if (!product.imageUrl) continue;

      // Extract the public_id from cloudinaryPublicId
      const publicId = product.cloudinaryPublicId;

      if (!publicId || !cloudinaryUrls.has(publicId)) {
        console.log(`Invalid URL for ${product.name}: ${product.imageUrl}`);
        invalidUrls++;
      }
    }

    console.log('\nVerification complete');
    console.log(`Total products: ${products.length}`);
    console.log(`Invalid URLs found: ${invalidUrls}`);
    console.log(`Products updated: ${updatedProducts}`);

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    process.exit();
  }
}

verifyCloudinaryUrls(); 