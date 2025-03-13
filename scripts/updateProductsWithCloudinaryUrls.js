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
    
    // Create multiple maps for different matching strategies
    const urlMaps = {
      byPublicId: new Map(cloudinaryUrls.map(item => [item.public_id, item])),
      byFilename: new Map(cloudinaryUrls.map(item => [item.filename, item])),
      byOriginalFilename: new Map(cloudinaryUrls.map(item => [item.original_filename, item]))
    };

    // Connect to MongoDB
    await dbConnect();
    const Product = getProductModel();
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to process`);
    
    let updated = 0;
    let skipped = 0;
    let errors = [];
    
    for (const product of products) {
      let cloudinaryData = null;
      
      // Try matching by existing cloudinaryPublicId
      if (product.cloudinaryPublicId) {
        cloudinaryData = urlMaps.byPublicId.get(product.cloudinaryPublicId);
      }
      
      // Try matching by imageKey
      if (!cloudinaryData && product.imageKey) {
        const basename = path.basename(product.imageKey, path.extname(product.imageKey));
        cloudinaryData = urlMaps.byFilename.get(basename);
      }
      
      // Try matching by slug
      if (!cloudinaryData && product.slug) {
        cloudinaryData = urlMaps.byFilename.get(product.slug);
      }

      if (cloudinaryData) {
        try {
          await Product.findByIdAndUpdate(product._id, {
            $set: {
              imageUrl: cloudinaryData.url,
              cloudinaryPublicId: cloudinaryData.public_id
            }
          });
          console.log(`✅ Updated ${product.name}`);
          updated++;
        } catch (error) {
          errors.push({ product: product.name, error: error.message });
          skipped++;
        }
      } else {
        console.log(`❌ No match found for ${product.name}`);
        errors.push({ product: product.name, error: 'No matching Cloudinary image found' });
        skipped++;
      }
    }
    
    // Save errors to a file for review
    fs.writeFileSync(
      path.join(__dirname, '..', 'data', 'cloudinary-update-errors.json'),
      JSON.stringify(errors, null, 2)
    );
    
    console.log('\nUpdate Summary:');
    console.log(`Total products: ${products.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Errors saved to data/cloudinary-update-errors.json`);
    
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    process.exit();
  }
}

updateProductsWithCloudinaryUrls(); 