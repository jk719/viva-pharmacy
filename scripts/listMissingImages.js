import dbConnect from '../lib/dbConnect.js';
import getProductModel from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listMissingImages() {
  try {
    // Read existing Cloudinary URLs
    const cloudinaryUrlsPath = path.join(__dirname, '..', 'data', 'cloudinaryUrls.json');
    const cloudinaryUrls = JSON.parse(fs.readFileSync(cloudinaryUrlsPath, 'utf8'));
    
    // Create a set of existing image filenames
    const existingImages = new Set(
      cloudinaryUrls.map(item => path.basename(item.public_id))
    );

    // Connect to MongoDB
    await dbConnect();
    const Product = getProductModel();
    
    // Get all products
    const products = await Product.find({});
    
    // Find products without Cloudinary URLs
    const missingImages = products
      .filter(product => !product.imageUrl)
      .map(product => ({
        name: product.name,
        imageKey: product.imageKey,
        filename: product.imageKey ? path.basename(product.imageKey) : null
      }));

    // Create output directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Save to file
    const outputPath = path.join(dataDir, 'missingImages.json');
    fs.writeFileSync(outputPath, JSON.stringify(missingImages, null, 2));

    // Print summary
    console.log('\nMissing Images Summary:');
    console.log(`Total products: ${products.length}`);
    console.log(`Products with images: ${products.length - missingImages.length}`);
    console.log(`Products missing images: ${missingImages.length}`);
    console.log(`\nList saved to: ${outputPath}`);

    // Print list of missing images
    console.log('\nMissing Images:');
    missingImages.forEach(({ name, filename }, index) => {
      console.log(`${index + 1}. ${name} (${filename})`);
    });

  } catch (error) {
    console.error('Error listing missing images:', error);
  } finally {
    process.exit();
  }
}

listMissingImages(); 