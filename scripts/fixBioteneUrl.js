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
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Simple base64 encoded 1x1 transparent PNG
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

async function fixBioteneUrl() {
  try {
    await dbConnect();
    const Product = await getProductModel();
    
    // Get the Biotene product
    const product = await Product.findOne({
      name: /biotène/i
    });

    if (!product) {
      console.log('Biotene product not found');
      return;
    }

    console.log('Found product:', product.name);

    // Create a simple URL-friendly name
    const simpleName = 'biotene-fluoride-toothpaste';
    const newPublicId = `viva-pharmacy-online-store/${simpleName}`;

    // First, try to find any existing images with similar names
    console.log('Searching for existing Biotene images...');
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'viva-pharmacy-online-store',
      max_results: 500
    });

    // Look for any image containing 'biotene' in its name
    const bioteneImage = resources.resources.find(r => 
      r.public_id.toLowerCase().includes('biotene')
    );

    if (bioteneImage) {
      // Use existing image
      console.log('Found existing Biotene image:', bioteneImage.public_id);
      await Product.updateOne(
        { _id: product._id },
        { 
          imageUrl: bioteneImage.secure_url,
          cloudinaryPublicId: bioteneImage.public_id
        }
      );
      console.log('Updated product with existing image URL');
    } else {
      // Upload placeholder image
      console.log('No existing Biotene image found. Uploading placeholder...');
      
      // First, delete the old image if it exists
      try {
        await cloudinary.uploader.destroy(newPublicId);
        console.log('Cleaned up old image');
      } catch (e) {
        // Ignore errors if image doesn't exist
      }

      const uploadResult = await cloudinary.uploader.upload(PLACEHOLDER_IMAGE, {
        public_id: simpleName,  // Remove the folder from public_id
        folder: 'viva-pharmacy-online-store',  // Specify folder separately
        overwrite: true
      });

      console.log('Upload result:', uploadResult);

      await Product.updateOne(
        { _id: product._id },
        { 
          imageUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id
        }
      );
      console.log('Created and updated product with new image:', uploadResult.secure_url);
    }

  } catch (error) {
    console.error('Error:', error);
    if (error.http_code) {
      console.error('HTTP Error Code:', error.http_code);
    }
    if (error.stack) {
      console.error('Stack Trace:', error.stack);
    }
  } finally {
    process.exit();
  }
}

fixBioteneUrl(); 