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

// Define Product Schema (match your existing schema)
const ProductSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
  // ... other fields
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function fixProductImages() {
  try {
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products in database`);

    // Get all Cloudinary images
    const cloudinaryResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'viva-pharmacy-online-store',
      max_results: 500
    });

    const cloudinaryImages = cloudinaryResult.resources;
    console.log(`Found ${cloudinaryImages.length} images in Cloudinary`);

    // Create a map of product names to Cloudinary URLs
    const imageMap = new Map();
    cloudinaryImages.forEach(image => {
      // Extract product name from the Cloudinary URL/public_id
      const productName = image.public_id
        .split('/').pop() // Get the filename
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/-/g, ' '); // Replace dashes with spaces
      
      imageMap.set(productName.toLowerCase(), image.secure_url);
    });

    // Update products with matching images
    let updated = 0;
    let notFound = 0;
    const notFoundProducts = [];

    for (const product of products) {
      const productNameLower = product.name.toLowerCase();
      // Try to find a matching image
      const matchingImage = imageMap.get(productNameLower) || 
                          Array.from(imageMap.entries())
                            .find(([key]) => productNameLower.includes(key))?.[1];

      if (matchingImage) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { imageUrl: matchingImage } }
        );
        updated++;
      } else {
        notFound++;
        notFoundProducts.push(product.name);
      }
    }

    console.log(`\nUpdate complete:`);
    console.log(`- Updated: ${updated} products`);
    console.log(`- No matching image: ${notFound} products`);
    
    if (notFoundProducts.length > 0) {
      console.log('\nProducts without matching images:');
      notFoundProducts.forEach(name => console.log(`- ${name}`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixProductImages(); 