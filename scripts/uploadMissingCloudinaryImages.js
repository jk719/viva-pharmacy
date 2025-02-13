import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '../lib/dbConnect.js';
import getProductModel from '../models/Product.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Map Cloudinary IDs to local filenames
const imageMapping = {
  'flonase-sensimist-24hr-allergy-relief-scent-free-nasal-spray-0-34oz': 
    'flonase-sensimist-24hr-allergy-relief-scent-free-nasal-spray-0.34oz.png',
  'children-s-flonase-sensimist-60-sprays': 
    'childrens-flonase-sensimist-60-sprays.png',
  'dr-teal-s-cooling-peppermint-pure-epsom-salt-foot-soak': 
    'dr-teals-cooling-peppermint-pure-epsom-salt-foot-soak-32oz.png',
  'hyland-s-kids-mucus-cough-nt-grp-liq-4oz': 
    'hylands-kids-mucus-cough-nt-grp-liq-4oz.png',
  'bayer-low-dose-aspirin-81mg-enteric-coated-tablets-32ct': 
    'bayer-aspirin-low-dose-81mg-enteric-tablets-120ct.png',
  'children-s-mucinex-stuffy-nose-chest-congestion-very-berry-flavor-4oz': 
    'childrens-mucinex-stuffy-nose-chest-congestion-very-berry-flavor-4oz.png'
};

async function uploadMissingImages() {
  try {
    await dbConnect();
    const Product = await getProductModel();
    
    console.log('Starting upload of missing images...\n');
    
    for (const [cloudinaryId, localFilename] of Object.entries(imageMapping)) {
      const localPath = path.join(__dirname, '..', 'public', 'images', 'products', localFilename);
      
      if (fs.existsSync(localPath)) {
        try {
          console.log(`Uploading ${localFilename}...`);
          
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(localPath, {
            public_id: `viva-pharmacy/products/${cloudinaryId}`,
            folder: 'viva-pharmacy/products',
            overwrite: true
          });
          
          // Update product in database
          await Product.updateOne(
            { cloudinaryPublicId: `viva-pharmacy/products/${cloudinaryId}` },
            { imageUrl: result.secure_url }
          );
          
          console.log(`✅ Successfully uploaded and updated ${cloudinaryId}\n`);
        } catch (error) {
          console.log(`❌ Failed to upload ${cloudinaryId}: ${error.message}\n`);
        }
      } else {
        console.log(`❌ Local image not found: ${localPath}\n`);
      }
    }
    
    console.log('Upload process complete!');
    
  } catch (error) {
    console.error('Upload failed:', error);
  } finally {
    process.exit();
  }
}

uploadMissingImages(); 