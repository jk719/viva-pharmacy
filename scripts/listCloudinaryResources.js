import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function listResources() {
  try {
    console.log('Fetching Cloudinary resources...');
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'viva-pharmacy-online-store',
      max_results: 500
    });

    const output = {
      total: resources.resources.length,
      resources: resources.resources.map(r => ({
        public_id: r.public_id,
        url: r.secure_url
      }))
    };

    fs.writeFileSync('data/cloudinary-resources.json', JSON.stringify(output, null, 2));
    console.log(`Found ${output.total} resources. Saved to data/cloudinary-resources.json`);

  } catch (error) {
    console.error('Failed to fetch resources:', error);
  }
}

listResources(); 