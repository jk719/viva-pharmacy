import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const ProductSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function fixCloudinaryUrls() {
  try {
    console.log('Getting products from MongoDB...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products\n`);

    console.log('Fetching images from Cloudinary...');
    const cloudinaryResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'viva-pharmacy-online-store',
      max_results: 500
    });
    console.log(`Found ${cloudinaryResult.resources.length} images\n`);

    console.log('Updating product URLs...');
    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      // Extract the image name from the current URL
      const currentUrlMatch = product.imageUrl.match(/\/([^/]+)\.jpg$/);
      if (!currentUrlMatch) {
        skipped++;
        continue;
      }

      const imageName = currentUrlMatch[1];
      
      // Find matching Cloudinary resource
      const cloudinaryImage = cloudinaryResult.resources.find(r => 
        r.public_id.endsWith(imageName)
      );

      if (cloudinaryImage) {
        // Create URL without version number
        const newUrl = cloudinaryImage.secure_url.replace(/\/v\d+\//, '/');
        
        await Product.updateOne(
          { _id: product._id },
          { $set: { imageUrl: newUrl } }
        );
        
        updated++;
        if (updated % 10 === 0) {
          console.log(`Progress: ${updated} products updated`);
        }
      } else {
        skipped++;
      }
    }

    console.log('\nUpdate complete:');
    console.log(`- Updated: ${updated} products`);
    console.log(`- Skipped: ${skipped} products`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixCloudinaryUrls(); 