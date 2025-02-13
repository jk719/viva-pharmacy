import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name correctly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Verify environment variables are loaded
console.log('Checking Cloudinary configuration:');
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API key length:', process.env.CLOUDINARY_API_KEY?.length);
console.log('API secret length:', process.env.CLOUDINARY_API_SECRET?.length);

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function listCloudinaryImages() {
  try {
    console.log('Fetching images from Cloudinary...');
    
    // List all images in the viva-pharmacy/products folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'viva-pharmacy/products/',
      max_results: 500
    });

    // Create a mapping of filename to URL
    const urlMapping = {};
    result.resources.forEach(resource => {
      const filename = path.basename(resource.public_id) + path.extname(resource.url);
      urlMapping[filename] = resource.secure_url;
    });

    // Write to a new JSON file
    const outputPath = path.join(__dirname, '..', 'data', 'cloudinaryUrlsNew.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(urlMapping, null, 2)
    );

    console.log('Total images found:', result.resources.length);
    console.log('URL mapping saved to:', outputPath);
    
    // Compare with existing mapping
    const existingPath = path.join(__dirname, '..', 'data', 'cloudinaryUrls.json');
    const existingUrls = JSON.parse(
      fs.readFileSync(existingPath, 'utf8')
    );
    
    console.log('\nComparison with existing mapping:');
    console.log('Existing URLs:', Object.keys(existingUrls).length);
    console.log('New URLs:', Object.keys(urlMapping).length);
    
    // Find differences
    const missingInNew = Object.keys(existingUrls)
      .filter(key => !urlMapping[key]);
    const missingInExisting = Object.keys(urlMapping)
      .filter(key => !existingUrls[key]);
    
    if (missingInNew.length) {
      console.log('\nFiles in existing but not found in Cloudinary:');
      missingInNew.forEach(file => console.log(`- ${file}`));
    }
    
    if (missingInExisting.length) {
      console.log('\nNew files found in Cloudinary:');
      missingInExisting.forEach(file => console.log(`- ${file}`));
    }

  } catch (error) {
    console.error('Error:', error);
    // Log more details about the error
    if (error.response) {
      console.error('Cloudinary API Error:', error.response.data);
    }
  }
}

listCloudinaryImages(); 