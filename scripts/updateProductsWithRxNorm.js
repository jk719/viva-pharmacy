import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import RxNormAPI from './rxNormAPI.js';
import getProductModel from '../models/Product.js';

// Get the directory path for the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local file
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const rxnorm = new RxNormAPI();

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function updateProductWithRxNormData(product) {
  try {
    console.log(`\nProcessing: ${product.name}`);
    
    // Get RxNorm data
    const concepts = await rxnorm.findByName(product.name);
    
    if (!concepts || concepts.length === 0) {
      console.log('No RxNorm concepts found');
      return null;
    }

    // Get the most relevant concept
    const concept = concepts[0];
    
    // Get additional RxNorm information
    const [details, ingredients] = await Promise.all([
      rxnorm.getDrugDetails(concept.rxcui),
      rxnorm.getIngredients(concept.rxcui)
    ]);

    // Prepare the update
    const rxnormData = {
      rxnorm: {
        rxcui: concept.rxcui,
        name: concept.name,
        tty: concept.tty,
        ageGroup: concept.ageGroup,
        ingredients: ingredients ? ingredients.map(ing => ({
          name: ing.name,
          rxcui: ing.rxcui
        })) : [],
        details: details
      }
    };

    // Update active ingredients if available
    if (ingredients && ingredients.length > 0) {
      rxnormData.activeIngredients = ingredients.map(ing => ({
        name: ing.name,
        amount: 'See package for details' // Default value since exact amount might not be available
      }));
    }

    // Update keywords based on RxNorm data
    const newKeywords = new Set(product.keywords || []);
    if (concept.name) {
      concept.name.split(' ').forEach(word => newKeywords.add(word));
    }
    if (ingredients) {
      ingredients.forEach(ing => {
        if (ing.name) {
          ing.name.split(' ').forEach(word => newKeywords.add(word));
        }
      });
    }
    rxnormData.keywords = Array.from(newKeywords);

    // Update dosage form if not already set
    if (!product.dosageForm || product.dosageForm === 'Other') {
      const dosageFormMap = {
        'Oral Tablet': 'Tablet',
        'Oral Capsule': 'Capsule',
        'Oral Solution': 'Liquid',
        'Oral Suspension': 'Liquid',
        'Topical Cream': 'Cream',
        'Topical Gel': 'Gel',
        'Nasal Spray': 'Spray',
        'Eye Drops': 'Drops',
        'Chewable Tablet': 'Tablet',
        'Disintegrating Tablet': 'Tablet'
      };

      for (const [rxnormForm, modelForm] of Object.entries(dosageFormMap)) {
        if (concept.name.includes(rxnormForm)) {
          rxnormData.dosageForm = modelForm;
          break;
        }
      }
    }

    // Update the product in MongoDB
    const Product = getProductModel();
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { $set: rxnormData },
      { new: true }
    );

    console.log(`Updated product: ${product.name}`);
    return updatedProduct;
  } catch (error) {
    console.error(`Error updating product ${product.name}:`, error);
    return null;
  }
}

async function updateAllProducts() {
  try {
    const Product = getProductModel();
    const products = await Product.find({});
    console.log(`Found ${products.length} products to process`);

    const results = {
      success: 0,
      failed: 0,
      total: products.length
    };

    // Process products in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(products.length/batchSize)}`);
      
      const updates = await Promise.all(
        batch.map(async (product) => {
          const result = await updateProductWithRxNormData(product);
          if (result) {
            results.success++;
          } else {
            results.failed++;
          }
          return result;
        })
      );

      // Add a small delay between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\nUpdate Summary:');
    console.log(`Total products: ${results.total}`);
    console.log(`Successfully updated: ${results.success}`);
    console.log(`Failed to update: ${results.failed}`);

  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the update
connectToDatabase()
  .then(updateAllProducts)
  .catch(console.error); 