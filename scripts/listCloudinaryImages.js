import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function listCloudinaryImages() {
  try {
    console.log('Fetching images from Cloudinary...');
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500
    });

    // Create a mapping of simplified names to actual resources
    const resourceMap = new Map();
    result.resources.forEach(resource => {
      // Get the filename without path and random suffix
      let filename = resource.public_id;
      
      // Remove the path if it exists
      filename = filename.replace('viva-pharmacy/products/', '');
      
      // Remove the random suffix (e.g., _mqx6hu)
      filename = filename.replace(/_[a-z0-9]+$/, '');
      
      // Remove .png if it's part of the public_id
      filename = filename.replace('.png', '');
      
      // Store both the original name and the cleaned version
      resourceMap.set(filename, {
        originalName: resource.public_id,
        url: resource.secure_url,
        created: new Date(resource.created_at).toLocaleString()
      });
    });

    // Read the list of needed images
    const neededImagesPath = path.join(__dirname, '..', 'data', 'productsNeedingUpload.json');
    const neededImages = JSON.parse(fs.readFileSync(neededImagesPath, 'utf8'));

    // Find matches
    const matches = {};
    const unmatched = [];

    neededImages.forEach(neededImage => {
      // Remove extension and clean up the name
      const baseName = path.basename(neededImage, '.png');
      
      // Look for matches
      if (resourceMap.has(baseName)) {
        matches[neededImage] = resourceMap.get(baseName);
      } else {
        // Try a fuzzy match
        const fuzzyMatch = Array.from(resourceMap.keys()).find(key => 
          key.toLowerCase().includes(baseName.toLowerCase()) ||
          baseName.toLowerCase().includes(key.toLowerCase())
        );
        
        if (fuzzyMatch) {
          matches[neededImage] = resourceMap.get(fuzzyMatch);
        } else {
          unmatched.push(neededImage);
        }
      }
    });

    // Print results
    console.log('\nFound matches:');
    Object.entries(matches).forEach(([neededImage, match]) => {
      console.log(`\n${neededImage}:`);
      console.log(`  Original ID: ${match.originalName}`);
      console.log(`  URL: ${match.url}`);
      console.log(`  Created: ${match.created}`);
    });

    console.log('\nUnmatched images that need to be uploaded:');
    unmatched.forEach(image => console.log(`- ${image}`));

    // Save matches to a file
    const matchesPath = path.join(__dirname, '..', 'data', 'cloudinaryMatches.json');
    fs.writeFileSync(matchesPath, JSON.stringify(matches, null, 2));
    console.log('\nMatches have been saved to:', matchesPath);

  } catch (error) {
    console.error('Error:', error);
  }
}

listCloudinaryImages(); 