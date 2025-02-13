import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function listCloudinaryUrls() {
  try {
    console.log('Fetching Cloudinary resources...');
    
    // Get all resources in the viva-pharmacy folder
    const result = await cloudinary.search
      .expression('folder:viva-pharmacy/*')
      .max_results(500)
      .execute();

    const urls = result.resources.map(resource => ({
      public_id: resource.public_id,
      url: resource.secure_url,
      filename: path.basename(resource.public_id)
    }));

    // Print to console
    console.log('\nCloudinary URLs:');
    urls.forEach(({ public_id, url }) => {
      console.log(`\nPublic ID: ${public_id}`);
      console.log(`URL: ${url}`);
    });

    // Save to file
    const outputPath = path.join(__dirname, '..', 'data', 'cloudinaryUrls.json');
    fs.writeFileSync(outputPath, JSON.stringify(urls, null, 2));
    console.log(`\nURLs saved to ${outputPath}`);
    
    // Summary
    console.log(`\nTotal images found: ${urls.length}`);

  } catch (error) {
    console.error('Error fetching Cloudinary resources:', error);
  }
}

listCloudinaryUrls(); 