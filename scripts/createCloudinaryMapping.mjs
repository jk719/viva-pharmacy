import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dv3cd1aoy',
  api_key: '697296867949647',
  api_secret: 'oip09T4PKDoFTawf5csZ1DxmZ_8'
});

async function getAllCloudinaryImages() {
  try {
    const result = {};
    let nextCursor = null;
    
    do {
      const options = {
        type: 'upload',
        max_results: 500,
        prefix: 'viva-pharmacy-online-store/'
      };

      if (nextCursor) {
        options.next_cursor = nextCursor;
      }

      const response = await cloudinary.api.resources(options);
      
      // Map the results
      response.resources.forEach(resource => {
        const filename = path.basename(resource.public_id);
        result[filename] = resource.secure_url;
      });

      nextCursor = response.next_cursor;
    } while (nextCursor);

    // Write to file
    await fs.writeFile(
      'data/cloudinaryUrlsClean.json',
      JSON.stringify(result, null, 2)
    );

    console.log('Successfully created cloudinaryUrlsClean.json');
    console.log(`Total images mapped: ${Object.keys(result).length}`);

  } catch (error) {
    console.error('Error fetching Cloudinary resources:', error);
  }
}

getAllCloudinaryImages(); 