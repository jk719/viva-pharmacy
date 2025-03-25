import { MongoClient } from 'mongodb';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

function cleanProductName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/\d+ct|\d+count|\d+pk|\d+pack/g, '')
    .replace(/exp-\d+|\d+oz|\d+fl|\d+mg/g, '')
    .replace(/-+/g, '-')
    .trim();
}

function findMatchingUrl(productName, cloudinaryUrls) {
  const cleanedName = cleanProductName(productName);
  
  // Create variations of the product name
  const variations = [
    cleanedName,
    cleanedName.replace(/-/g, ''),
    ...cleanedName.split('-')
  ];

  for (const [filename, url] of Object.entries(cloudinaryUrls)) {
    const cleanedFilename = cleanProductName(filename.replace('.jpg', '').replace('.png', ''));
    
    // Check for matches
    for (const variation of variations) {
      if (cleanedFilename.includes(variation) || variation.includes(cleanedFilename)) {
        return url;
      }
    }
  }

  return null;
}

async function updateProducts() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log('Loading Cloudinary URLs...');
    const cloudinaryUrls = JSON.parse(
      await fs.readFile('data/cloudinaryUrlsClean.json', 'utf8')
    );

    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db('vivaPharmacy');
    const products = db.collection('products');

    const allProducts = await products.find({}).toArray();
    console.log(`Processing ${allProducts.length} products...`);

    let updated = 0;
    let skipped = 0;
    let errors = [];
    let matchingDetails = [];

    for (const product of allProducts) {
      try {
        const imageUrl = findMatchingUrl(product.name, cloudinaryUrls);

        if (imageUrl) {
          await products.updateOne(
            { _id: product._id },
            {
              $set: {
                imageUrl,
                updatedAt: new Date()
              }
            }
          );
          updated++;
          console.log(`✅ Updated: ${product.name}`);
          matchingDetails.push({
            productName: product.name,
            cleanedName: cleanProductName(product.name),
            imageUrl
          });
        } else {
          skipped++;
          console.log(`⚠️ No match: ${product.name}`);
          errors.push({
            productName: product.name,
            cleanedName: cleanProductName(product.name),
            reason: 'No matching image found'
          });
        }
      } catch (error) {
        console.error(`❌ Error with ${product.name}:`, error);
        errors.push({
          productName: product.name,
          error: error.message
        });
      }
    }

    // Save reports
    await fs.writeFile(
      'data/matching-details.json',
      JSON.stringify(matchingDetails, null, 2)
    );

    await fs.writeFile(
      'data/update-errors.json',
      JSON.stringify(errors, null, 2)
    );

    console.log('\nUpdate Summary:');
    console.log(`✅ Updated: ${updated} products`);
    console.log(`⚠️ Skipped: ${skipped} products`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log('\nReports saved:');
    console.log('- data/matching-details.json');
    console.log('- data/update-errors.json');

  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

updateProducts(); 