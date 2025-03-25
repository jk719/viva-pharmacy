import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configure Cloudinary with your existing env variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function verifyCloudinaryStructure() {
  try {
    console.log('Checking Cloudinary configuration...');
    console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'viva-pharmacy-online-store',
      max_results: 500
    });
    
    console.log('\nCloudinary structure verification:');
    console.log(`Total resources found: ${result.resources.length}`);
    console.log('\nSample URLs:');
    result.resources.slice(0, 5).forEach(resource => {
      console.log(resource.secure_url);
    });
  } catch (error) {
    console.error('Error verifying Cloudinary structure:', error.message);
    if (error.http_code) {
      console.error('HTTP Status:', error.http_code);
    }
  }
}

verifyCloudinaryStructure(); 