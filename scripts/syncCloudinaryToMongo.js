import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '../lib/dbConnect.js';
import getProductModel from '../models/Product.js';
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

async function syncCloudinaryToMongo() {
  try {
    console.log('Starting Cloudinary sync...');
    
    // Get all resources from root folder
    const rootResult = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      prefix: ''
    });

    // Get all resources from viva-pharmacy/products folder
    const folderResult = await cloudinary.search
      .expression('folder:viva-pharmacy/products/*')
      .max_results(500)
      .execute();

    const allResources = [...rootResult.resources, ...folderResult.resources];
    console.log(`Found ${allResources.length} total images in Cloudinary`);
    
    // Create a map of filename patterns to Cloudinary data
    const cloudinaryMap = new Map();
    const specificMappings = {
      'mucinex-instasoothe-honey-echinacea-throat-drops-20ct': 'mucinex-instasoothe-honey-echinacea-throat-drop',
      'zarbee-s-children-s-cough-mucus-night-syrup': 'zarbees-childrens-cough-mucus-night-syrup',
      'zarbee-s-children-s-cough-mucus-day-syrup': 'zarbees-childrens-cough-mucus-day-syrup',
      'hyland-s-kids-cough-mucus-daytime-grape-liquid-4oz': 'hylands-kids-cough-mucus-daytime-grape-liquid-4o',
      'mucinex-fast-max-cold-flu-severe-6oz': 'mucinex-fast-max-nt-shft-cld-flu',
      'tums-smoothies-extra-strength-antacid-tablets-assorted-fruit-60ct': [
        'tums-smoothies-extra-strength-assorted-fruit',
        'tums-smoothies-assorted-fruit',
        'tums-smoothies',
        'tums-chewy-bites-extra-strength-assorted-fruit',
        'tums-chewy-bites-assorted-fruit',
        'tums-ex-str-smoothies-asstd-fruit',
        'tums-smoothies-extra-strength',
        'tums-smoothies-antacid'
      ]
    };

    allResources.forEach(resource => {
      // Get base filename without extension and random suffix
      const filename = path.basename(resource.public_id)
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/_[a-z0-9]+$/, ''); // Remove random suffix

      // Add to map with original filename
      cloudinaryMap.set(filename.toLowerCase(), {
        url: resource.secure_url,
        public_id: resource.public_id
      });

      // Check if this resource matches any specific mappings
      Object.entries(specificMappings).forEach(([productKey, cloudinaryKeys]) => {
        // Handle both single string and array of strings
        const keysArray = Array.isArray(cloudinaryKeys) ? cloudinaryKeys : [cloudinaryKeys];
        
        keysArray.forEach(cloudinaryKey => {
          if (filename.toLowerCase().includes(cloudinaryKey.toLowerCase())) {
            cloudinaryMap.set(productKey, {
              url: resource.secure_url,
              public_id: resource.public_id
            });
          }
        });
      });

      // Add additional filename variations
      const variations = [
        filename,
        filename.replace(/-/g, ' '), // Replace hyphens with spaces
        filename.replace(/bag-s-f/i, 'sugar-free'), // Special case for Ricola
        filename.replace(/nt-grp/i, 'nighttime-grape'), // Special case for Hyland's
        filename.replace(/cld-flu-sr/i, 'cold-flu-severe'), // Special case for Mucinex
        filename.replace(/nt-shft/i, 'night-shift'), // Special case for Mucinex
        filename.replace(/liq/i, 'liquid'), // Abbreviation handling
        filename.replace(/cpl/i, 'caplets'), // Abbreviation handling
        
        // Special cases for remaining unmatched products
        filename.replace(/ricola-bag-s-f-swiss-herb-drp/i, 'ricola-sugar-free-swiss-herb-drops'),
        filename.replace(/mucinex-instasoothe/i, 'mucinex-insta-soothe'),
        filename.replace(/zarbees-childrens/i, 'zarbee-s-children-s'),
        filename.replace(/hylands-kids/i, 'hyland-s-kids'),
        filename.replace(/mucinex-fast-max-nt-shft/i, 'mucinex-fast-max-night-shift'),
        filename.replace(/childrens-tylenol/i, 'children-s-tylenol'),
        filename.replace(/tums-chewy/i, 'tums-smoothies'),
        
        // Additional specific variations
        filename.replace(/throat-drop-/i, 'throat-drops-'),
        filename.replace(/liquid-4o/i, 'liquid-4oz'),
        filename.replace(/nt-shft-cld-flu/i, 'cold-flu-severe'),
        filename.replace(/smoothies-/i, 'smoothies-extra-strength-'),
        
        // Additional Tums-specific variations
        filename.replace(/smoothies/i, 'chewy-bites'),
        filename.replace(/chewy-bites/i, 'smoothies'),
        filename.replace(/ex-str/i, 'extra-strength'),
        filename.replace(/asstd/i, 'assorted'),
        filename.replace(/-tablets/i, ''),
        filename.replace(/-60ct/i, ''),
      ];

      // Add all variations to the map
      variations.forEach(variant => {
        cloudinaryMap.set(variant.toLowerCase(), {
          url: resource.secure_url,
          public_id: resource.public_id
        });

        // Add additional variations with common replacements
        cloudinaryMap.set(variant.toLowerCase().replace(/\s+/g, '-'), {
          url: resource.secure_url,
          public_id: resource.public_id
        });
        cloudinaryMap.set(variant.toLowerCase().replace(/-/g, ' '), {
          url: resource.secure_url,
          public_id: resource.public_id
        });
      });
    });

    // Connect to MongoDB
    await dbConnect();
    const Product = getProductModel();
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products in MongoDB`);
    
    let updated = 0;
    let skipped = 0;
    let notFound = 0;
    
    for (const product of products) {
      // Skip if product already has imageUrl
      if (product.imageUrl) {
        console.log(`Skipping ${product.name} - already has imageUrl`);
        skipped++;
        continue;
      }

      // When looking up products, try the specific mappings first
      const productKey = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let cloudinaryData = cloudinaryMap.get(productKey);
      
      // If not found, check if there's a specific mapping
      if (!cloudinaryData && specificMappings[productKey]) {
        const mappings = Array.isArray(specificMappings[productKey]) 
          ? specificMappings[productKey] 
          : [specificMappings[productKey]];
          
        for (const mapping of mappings) {
          cloudinaryData = cloudinaryMap.get(mapping);
          if (cloudinaryData) break;
        }
      }

      if (cloudinaryData) {
        // Update product with Cloudinary data
        await Product.findByIdAndUpdate(product._id, {
          $set: {
            imageUrl: cloudinaryData.url,
            cloudinaryPublicId: cloudinaryData.public_id
          }
        });
        console.log(`✅ Updated ${product.name} with Cloudinary URL`);
        updated++;
      } else {
        console.log(`❌ No Cloudinary image found for ${product.name} (${productKey})`);
        notFound++;
      }
    }
    
    console.log('\nSync Summary:');
    console.log(`Total products: ${products.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped (already had URL): ${skipped}`);
    console.log(`Not found in Cloudinary: ${notFound}`);
    
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    process.exit();
  }
}

syncCloudinaryToMongo(); 