import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

async function listAllResources() {
  try {
    console.log('Fetching ALL Cloudinary resources...');
    
    // Get all resources without folder restriction
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      prefix: '' // empty prefix to get everything
    });

    console.log('\nFound Resources:');
    result.resources.forEach(resource => {
      console.log(`\nPublic ID: ${resource.public_id}`);
      console.log(`URL: ${resource.secure_url}`);
      console.log(`Format: ${resource.format}`);
      console.log(`Folder: ${path.dirname(resource.public_id)}`);
    });

    console.log('\nSummary:');
    console.log(`Total resources found: ${result.resources.length}`);
    
    // List all folders
    const folders = await cloudinary.api.root_folders();
    console.log('\nFolders:');
    folders.folders.forEach(folder => {
      console.log(folder.path);
    });

  } catch (error) {
    console.error('Error fetching Cloudinary resources:', error);
    console.error('Error details:', error.error || error);
  }
}

listAllResources(); 