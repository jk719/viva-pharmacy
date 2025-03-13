import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dbConnect from '../lib/dbConnect.js';
import getProductModel from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configure Cloudinary with the correct environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function mapProductImages() {
  try {
    console.log('Cloudinary Configuration:', {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY?.slice(0, 5) + '...',  // Log only first 5 chars for security
      hasSecret: !!process.env.CLOUDINARY_API_SECRET
    });

    // Connect to MongoDB
    await dbConnect();
    const Product = getProductModel();
    
    // Get all products from database
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products in database`);
    
    // Get all images from Cloudinary
    const result = await cloudinary.search
      .expression('resource_type:image')
      .with_field('context')
      .with_field('tags')
      .max_results(500)
      .execute();
    
    console.log(`Found ${result.resources.length} images in Cloudinary`);
    
    // Create mapping of product names to Cloudinary data
    const imageMapping = {};
    const errors = [];
    
    // Process each product
    for (const product of products) {
      try {
        // Clean product name for matching
        const cleanName = product.name
          .toLowerCase()
          .replace(/['']/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
          
        // Find matching Cloudinary image
        const cloudinaryImage = result.resources.find(resource => {
          const resourceName = resource.public_id.toLowerCase();
          return resourceName.includes(cleanName) || 
                 (product.cloudinaryPublicId && resourceName.includes(product.cloudinaryPublicId.toLowerCase()));
        });
        
        if (cloudinaryImage) {
          imageMapping[product._id] = {
            productName: product.name,
            cloudinaryPublicId: cloudinaryImage.public_id,
            imageUrl: cloudinaryImage.secure_url,
            originalData: {
              cloudinaryPublicId: product.cloudinaryPublicId,
              imageUrl: product.imageUrl,
              imageKey: product.imageKey
            }
          };
          console.log(`✅ Found match for: ${product.name}`);
        } else {
          errors.push({
            productName: product.name,
            error: 'No matching Cloudinary image found',
            cleanName,
            searchedFor: cleanName
          });
          console.log(`❌ No match for: ${product.name}`);
        }
      } catch (error) {
        errors.push({
          productName: product.name,
          error: error.message
        });
        console.error(`Error processing ${product.name}:`, error);
      }
    }
    
    // Save mappings
    const mappingPath = path.join(__dirname, '..', 'data', 'productImageMapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2));
    console.log(`Saved mappings to ${mappingPath}`);
    
    // Save errors
    const errorsPath = path.join(__dirname, '..', 'data', 'imageMapErrors.json');
    fs.writeFileSync(errorsPath, JSON.stringify(errors, null, 2));
    console.log(`Saved errors to ${errorsPath}`);
    
    console.log('\nSummary:');
    console.log(`Total products processed: ${products.length}`);
    console.log(`Successful matches: ${Object.keys(imageMapping).length}`);
    console.log(`Errors/No matches: ${errors.length}`);
    
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    process.exit();
  }
}

mapProductImages(); 