import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

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

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '..', 'images-to-upload');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

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

const uploadImage = async (filepath) => {
  try {
    const filename = path.basename(filepath);
    
    // Skip if not an image
    if (!['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(path.extname(filename).toLowerCase())) {
      return null;
    }
    
    console.log(`Uploading ${filename}...`);
    
    const result = await cloudinary.uploader.upload(filepath, {
      folder: 'viva-pharmacy/products',
      public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
      overwrite: true
    });
    
    console.log(`✅ Uploaded ${filename}`);
    console.log(`URL: ${result.secure_url}`);
    
    // Update mapping file
    const mappingPath = path.join(__dirname, '..', 'data', 'cloudinaryUrlsClean.json');
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    mapping[filename] = result.secure_url;
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    
    // Move uploaded file to processed folder
    const processedDir = path.join(__dirname, '..', 'images-processed');
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir);
    }
    fs.renameSync(filepath, path.join(processedDir, filename));
    
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${path.basename(filepath)}:`, error);
    return null;
  }
};

// Watch for new files
console.log(`\nWatching ${imagesDir} for new images...`);
console.log('Drop your images into this folder to upload them to Cloudinary\n');

const watcher = chokidar.watch(imagesDir, {
  ignored: /(^|[\/\\])\../, // Ignore hidden files
  persistent: true
});

watcher
  .on('add', async filepath => {
    // First ensure placeholder exists
    const placeholderUrl = await uploadPlaceholder();
    if (!placeholderUrl) {
      console.error('Failed to upload placeholder image');
      return;
    }
    
    // Then upload the new image
    await uploadImage(filepath);
  });

// Print the list of needed images
const neededImagesPath = path.join(__dirname, '..', 'data', 'productsNeedingUpload.json');
if (fs.existsSync(neededImagesPath)) {
  const neededImages = JSON.parse(fs.readFileSync(neededImagesPath, 'utf8'));
  console.log('Images needed:');
  neededImages.forEach((image, index) => {
    console.log(`${index + 1}. ${image}`);
  });
} 