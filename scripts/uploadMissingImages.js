import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadMissingImages() {
  try {
    // Read the matches file to know what's already uploaded
    const matchesPath = path.join(__dirname, '..', 'data', 'cloudinaryMatches.json');
    const matches = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));

    // Read the list of all needed images
    const neededImagesPath = path.join(__dirname, '..', 'data', 'productsNeedingUpload.json');
    const neededImages = JSON.parse(fs.readFileSync(neededImagesPath, 'utf8'));

    // Find images that need to be uploaded
    const imagesToUpload = neededImages.filter(image => !matches[image]);

    console.log('Images to upload:', imagesToUpload);
    
    // Upload each missing image
    for (const image of imagesToUpload) {
      const imagePath = path.join(__dirname, '..', 'public', 'images', 'products', image);
      
      if (!fs.existsSync(imagePath)) {
        console.error(`Image file not found: ${imagePath}`);
        continue;
      }

      console.log(`Uploading ${image}...`);
      
      // Upload to the products folder in Cloudinary
      const result = await cloudinary.uploader.upload(imagePath, {
        folder: 'viva-pharmacy/products',
        public_id: path.basename(image, '.png') // Remove .png extension
      });

      console.log(`Uploaded ${image}:`);
      console.log(`  URL: ${result.secure_url}`);
      console.log(`  Public ID: ${result.public_id}`);
      
      // Add to matches
      matches[image] = {
        originalName: result.public_id,
        url: result.secure_url,
        created: new Date().toLocaleString()
      };
    }

    // Save updated matches
    fs.writeFileSync(matchesPath, JSON.stringify(matches, null, 2));
    console.log('\nUpdated matches have been saved to:', matchesPath);

  } catch (error) {
    console.error('Error:', error);
  }
}

uploadMissingImages(); 