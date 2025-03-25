import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function listAllResources() {
  try {
    const result = {};
    let nextCursor = null;
    let totalImages = 0;

    console.log('Starting to fetch images from Cloudinary...');
    console.log(`Looking in folder: viva-pharmacy-online-store`);

    do {
      const options = {
        type: 'upload',
        max_results: 500,
        prefix: 'viva-pharmacy-online-store/',
        resource_type: 'image'
      };

      if (nextCursor) {
        options.next_cursor = nextCursor;
      }

      console.log('Fetching batch of images...');
      const response = await cloudinary.api.resources(options);
      
      response.resources.forEach(resource => {
        // Get just the filename without the path
        const filename = path.basename(resource.public_id);
        // Store the full URL
        result[filename] = resource.secure_url;
        totalImages++;
      });

      nextCursor = response.next_cursor;
      console.log(`Processed ${Object.keys(result).length} images so far...`);

    } while (nextCursor);

    // Create data directory if it doesn't exist
    await fs.mkdir('data', { recursive: true });

    // Write results to file
    await fs.writeFile(
      'data/cloudinaryUrlsClean.json',
      JSON.stringify(result, null, 2)
    );

    console.log('\nSummary:');
    console.log(`Total images found: ${totalImages}`);
    console.log('Results saved to data/cloudinaryUrlsClean.json');
    console.log('\nSample URLs:');
    // Show first 3 URLs as examples
    Object.entries(result).slice(0, 3).forEach(([filename, url]) => {
      console.log(`${filename}: ${url}`);
    });

  } catch (error) {
    console.error('Error listing Cloudinary resources:', error.message);
    if (error.error) {
      console.error('Cloudinary error details:', error.error);
    }
    process.exit(1);
  }
}

listAllResources(); 