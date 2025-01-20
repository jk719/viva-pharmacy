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

// Create placeholder SVG
const placeholderSvg = `
<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#f3f4f6"/>
  <text x="50%" y="45%" font-family="Arial" font-size="16" fill="#9ca3af" text-anchor="middle">
    No Image
  </text>
  <text x="50%" y="55%" font-family="Arial" font-size="14" fill="#9ca3af" text-anchor="middle">
    Available
  </text>
</svg>`;

const uploadPlaceholder = async () => {
  try {
    console.log('Uploading placeholder image...');
    const result = await cloudinary.uploader.upload(
      `data:image/svg+xml;base64,${Buffer.from(placeholderSvg).toString('base64')}`,
      {
        folder: 'viva-pharmacy/products',
        public_id: 'placeholder',
        overwrite: true
      }
    );
    console.log('Placeholder image uploaded successfully:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading placeholder:', error);
    return null;
  }
};

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
  
  // First upload the placeholder
  const placeholderUrl = await uploadPlaceholder();
  if (!placeholderUrl) {
    console.error('Failed to upload placeholder image');
    return;
  }
  
  const productsDir = path.join(process.cwd(), 'public/images/products');
  console.log('Reading from directory:', productsDir);
  
  const files = fs.readdirSync(productsDir);
  console.log(`Found ${files.length} files to process`);
  
  const imageUrls = {
    'placeholder.svg': placeholderUrl // Add placeholder to URLs
  };
  
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
  
  // Log the placeholder URL for use in ClientProductView
  console.log('\nPlaceholder image URL (use this in ClientProductView.js):');
  console.log(placeholderUrl);
};

// Run the migration
migrateImagesToCloudinary().catch(console.error); 