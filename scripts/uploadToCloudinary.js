import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Log Cloudinary config for verification
console.log('Starting upload with Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY?.slice(0, 4) + '...',
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (imagePath) => {
  try {
    console.log(`Uploading: ${imagePath}`);
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'viva-pharmacy/products'
    });
    console.log(`Successfully uploaded: ${imagePath}`);
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${imagePath}:`, error);
    return null;
  }
};

const migrateImagesToCloudinary = async () => {
  console.log('Starting image migration...');
  
  const productsDir = path.join(process.cwd(), 'public/images/products');
  console.log('Reading from directory:', productsDir);
  
  const files = fs.readdirSync(productsDir);
  console.log(`Found ${files.length} files to process`);
  
  const imageUrls = {};
  
  for (const file of files) {
    const imagePath = path.join(productsDir, file);
    const cloudinaryUrl = await uploadImage(imagePath);
    if (cloudinaryUrl) {
      imageUrls[file] = cloudinaryUrl;
    }
  }
  
  // Save URLs to a JSON file
  const outputPath = path.join(process.cwd(), 'data/cloudinaryUrls.json');
  fs.writeFileSync(outputPath, JSON.stringify(imageUrls, null, 2));
  console.log(`Migration complete. URLs saved to ${outputPath}`);
};

// Run the migration
migrateImagesToCloudinary().catch(console.error); 