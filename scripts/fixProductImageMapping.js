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

function normalizeText(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

function findBestMatch(productName, cloudinaryImages) {
  const normalizedProductName = normalizeText(productName);
  let bestMatch = null;
  let bestScore = 0;

  for (const image of cloudinaryImages) {
    const imageName = normalizeText(image.public_id.split('/').pop().replace(/\.[^/.]+$/, ''));
    
    // Calculate match score
    const words = normalizedProductName.split(' ');
    let score = 0;
    
    for (const word of words) {
      if (word.length > 2 && imageName.includes(word)) { // Only count words longer than 2 characters
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = image;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

async function fixProductImageMapping() {
  try {
    console.log('Getting products from MongoDB...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    console.log('\nFetching images from Cloudinary...');
    const cloudinaryResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'viva-pharmacy-online-store',
      max_results: 500
    });
    console.log(`Found ${cloudinaryResult.resources.length} images`);

    let updated = 0;
    let skipped = 0;
    const unmatchedProducts = [];

    console.log('\nUpdating product images...');
    for (const product of products) {
      const match = findBestMatch(product.name, cloudinaryResult.resources);
      
      if (match) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { imageUrl: match.secure_url } }
        );
        updated++;
        if (updated % 10 === 0) {
          console.log(`Progress: ${updated} products updated`);
        }
      } else {
        skipped++;
        unmatchedProducts.push(product.name);
      }
    }

    console.log('\nUpdate complete:');
    console.log(`- Updated: ${updated} products`);
    console.log(`- Skipped: ${skipped} products`);
    
    if (unmatchedProducts.length > 0) {
      console.log('\nProducts without matching images:');
      unmatchedProducts.forEach(name => console.log(`- ${name}`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixProductImageMapping(); 