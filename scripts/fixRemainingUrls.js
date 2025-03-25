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

function normalizeString(str) {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]/g, '-')      // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-')             // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');          // Remove leading/trailing hyphens
}

async function fixRemainingUrls() {
  try {
    console.log('Getting products from MongoDB...');
    const products = await Product.find({
      name: "biotène Fluoride Toothpaste for Dry Mouth Symptoms, Bad Breath Treatment and Cavity Prevention, Fresh Mint - 4.3 oz"
    });
    
    if (products.length === 0) {
      console.log('Product not found in database');
      return;
    }

    console.log('\nFetching images from Cloudinary...');
    const cloudinaryResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'viva-pharmacy-online-store',
      max_results: 500
    });

    const product = products[0];
    const normalizedName = normalizeString(product.name);
    
    // Find matching Cloudinary resource
    const cloudinaryImage = cloudinaryResult.resources.find(r => {
      const resourceName = normalizeString(r.public_id);
      return resourceName.includes('biotene') || resourceName.includes('biotène');
    });

    if (cloudinaryImage) {
      await Product.updateOne(
        { _id: product._id },
        { $set: { imageUrl: cloudinaryImage.secure_url } }
      );
      console.log('Successfully updated Biotène product URL');
      console.log('New URL:', cloudinaryImage.secure_url);
    } else {
      console.log('Could not find matching image for Biotène product');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixRemainingUrls(); 