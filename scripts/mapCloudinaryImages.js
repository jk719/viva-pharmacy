import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function mapCloudinaryImages() {
  try {
    console.log('Fetching images from Cloudinary...');
    
    // Get all resources from the products folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'viva-pharmacy/products/',
      max_results: 500,
      metadata: true // Include metadata
    });

    console.log(`Found ${result.resources.length} images`);

    // Read existing mapping
    const existingPath = path.join(__dirname, '..', 'data', 'cloudinaryUrls.json');
    const existingUrls = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
    
    // Create new mapping
    const newMapping = {};
    const unmappedImages = [];
    
    // For each product in existing mapping
    for (const [productName, oldUrl] of Object.entries(existingUrls)) {
      // Find matching image in Cloudinary
      const matchingImage = result.resources.find(resource => {
        // Try to match by original filename or public_id
        const filename = path.basename(resource.public_id);
        const productKey = productName.replace('.png', '');
        return filename.includes(productKey) || 
               resource.public_id.includes(productKey);
      });

      if (matchingImage) {
        newMapping[productName] = matchingImage.secure_url;
        console.log(`✅ Mapped: ${productName}`);
      } else {
        unmappedImages.push(productName);
        console.log(`❌ Not found: ${productName}`);
      }
    }

    // Save new mapping
    const newPath = path.join(__dirname, '..', 'data', 'cloudinaryUrlsNew.json');
    fs.writeFileSync(
      newPath,
      JSON.stringify(newMapping, null, 2)
    );

    console.log('\nSummary:');
    console.log(`Total products: ${Object.keys(existingUrls).length}`);
    console.log(`Successfully mapped: ${Object.keys(newMapping).length}`);
    console.log(`Failed to map: ${unmappedImages.length}`);

    if (unmappedImages.length > 0) {
      console.log('\nUnmapped products:');
      unmappedImages.forEach(name => console.log(`- ${name}`));
    }

    // List all Cloudinary images that weren't mapped
    const mappedPublicIds = new Set(
      Object.values(newMapping).map(url => {
        const matches = url.match(/\/v\d+\/(.+)$/);
        return matches ? matches[1] : null;
      })
    );

    const unmappedCloudinaryImages = result.resources
      .filter(resource => !mappedPublicIds.has(resource.public_id))
      .map(resource => resource.public_id);

    if (unmappedCloudinaryImages.length > 0) {
      console.log('\nUnused Cloudinary images:');
      unmappedCloudinaryImages.forEach(id => console.log(`- ${id}`));
    }

  } catch (error) {
    console.error('Error:', error);
    if (error.error && error.error.message) {
      console.error('Cloudinary error:', error.error.message);
    }
  }
}

mapCloudinaryImages(); 