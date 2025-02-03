import dbConnect from '../lib/dbConnect.js';
import mongoose from 'mongoose';
import { categories } from '../data/categories.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ScriptRunner } from './utils/scriptRunner.js';
import { DatabaseOperationManager } from './utils/databaseOperationManager.js';
import { DataValidationManager } from './utils/dataValidationManager.js';
import { VerificationManager } from './utils/verificationManager.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

// Helper function to determine category and item based on product name
function determineCategory(product) {
  const name = product.name.toLowerCase();
  
  // First Aid products
  if (name.includes('band-aid') || name.includes('bandage')) {
    const category = categories.find(c => c.name === 'First Aid');
    return {
      category,
      item: category.items.find(i => i.name === 'Bandages & Dressings')
    };
  }
  
  // Cold & Flu
  if (name.includes('cold') || name.includes('flu') || name.includes('mucinex') || 
      name.includes('robitussin') || name.includes('dayquil') || name.includes('vicks') || 
      name.includes('theraflu') || name.includes('coricidin') || name.includes('halls') ||
      name.includes('cough') || name.includes('congestion') || name.includes('sinus')) {
    const category = categories.find(c => c.name === 'Cold & Flu');
    const item = category.items.find(i => {
      if (name.includes('spray') || name.includes('nasal')) return i.name === 'Nasal Sprays';
      if (name.includes('cough')) return i.name === 'Cough Medicines';
      return i.name === 'Multi-Symptom Relief';
    });
    return { category, item };
  }
  
  // Pain & Fever
  if (name.includes('tylenol') || name.includes('advil') || name.includes('aleve') || 
      name.includes('aspirin') || name.includes('pain') || name.includes('fever')) {
    const category = categories.find(c => c.name === 'Pain & Fever');
    const item = category.items.find(i => 
      name.includes('gel') || name.includes('cream') || name.includes('topical') ? 
      i.name === 'Topical Pain Relief' : i.name === 'Oral Pain Relief'
    );
    return { category, item };
  }
  
  // Digestive Health
  if (name.includes('pepto') || name.includes('imodium') || name.includes('tums') || 
      name.includes('pepcid') || name.includes('prilosec') || name.includes('mylanta') ||
      name.includes('antacid') || name.includes('digestive')) {
    const category = categories.find(c => c.name === 'Digestive Health');
    const item = category.items.find(i => {
      if (name.includes('antacid') || name.includes('tums') || 
          name.includes('pepcid') || name.includes('prilosec')) return i.name === 'Antacids';
      if (name.includes('diarrhea') || name.includes('imodium')) return i.name === 'Anti-Diarrheal';
      return i.name === 'Antacids';
    });
    return { category, item };
  }
  
  // Allergy Relief
  if (name.includes('allergy') || name.includes('benadryl') || name.includes('claritin') || 
      name.includes('zyrtec') || name.includes('flonase') || name.includes('xyzal')) {
    const category = categories.find(c => c.name === 'Allergy Relief');
    const item = category.items.find(i => 
      name.includes('nasal') || name.includes('flonase') ? 
      i.name === 'Nasal Allergy' : i.name === 'Antihistamines'
    );
    return { category, item };
  }
  
  // Children's Medicine
  if (name.includes('children') || name.includes('kids') || name.includes('pediatric')) {
    if (name.includes('vitamin') || name.includes('probiotic') || name.includes('melatonin')) {
      const category = categories.find(c => c.name === "Children's Wellness");
      const item = category.items.find(i => {
        if (name.includes('probiotic')) return i.name === 'Probiotics';
        if (name.includes('sleep') || name.includes('melatonin')) return i.name === 'Sleep Support';
        return i.name === 'Vitamins';
      });
      return { category, item };
    } else {
      const category = categories.find(c => c.name === "Children's Medicine");
      const item = category.items.find(i => {
        if (name.includes('cough') || name.includes('cold')) return i.name === 'Cough & Cold';
        if (name.includes('pain') || name.includes('fever')) return i.name === 'Pain & Fever';
        if (name.includes('allergy')) return i.name === 'Allergy';
        return i.name === 'Cough & Cold';
      });
      return { category, item };
    }
  }
  
  // Vitamins & Supplements
  if (name.includes('vitamin') || name.includes('supplement') || 
      name.includes('nature made') || name.includes('megared') || 
      name.includes('move free')) {
    const category = categories.find(c => c.name === 'Vitamins & Supplements');
    const item = category.items.find(i => {
      if (name.includes('joint')) return i.name === 'Joint Health';
      if (name.includes('immune') || name.includes('vitamin c')) return i.name === 'Immune Support';
      if (name.includes('prenatal')) return i.name === 'Prenatal Vitamins';
      return i.name === 'Multivitamins';
    });
    return { category, item };
  }
  
  // Feminine Care
  if (name.includes('monistat') || name.includes('vaginal')) {
    const category = categories.find(c => c.name === 'Feminine Care');
    return {
      category,
      item: category.items.find(i => i.name === 'Vaginal Health')
    };
  }
  
  // Special cases for specific products
  if (name.includes('milk of magnesia')) {
    const category = categories.find(c => c.name === 'Digestive Health');
    return {
      category,
      item: category.items.find(i => i.name === 'Laxatives')
    };
  }
  
  if (name.includes('afrin')) {
    const category = categories.find(c => c.name === 'Cold & Flu');
    return {
      category,
      item: category.items.find(i => i.name === 'Nasal Sprays')
    };
  }
  
  if (name.includes('bengay') || name.includes('voltaren')) {
    const category = categories.find(c => c.name === 'Pain & Fever');
    return {
      category,
      item: category.items.find(i => i.name === 'Topical Pain Relief')
    };
  }
  
  if (name.includes('cepacol') || name.includes('throat lozenge')) {
    const category = categories.find(c => c.name === 'Cold & Flu');
    return {
      category,
      item: category.items.find(i => i.name === 'Cough Medicines')
    };
  }
  
  // Special cases for remaining products
  if (name.includes('ricola') || name.includes('cough drop')) {
    const category = categories.find(c => c.name === 'Cold & Flu');
    return {
      category,
      item: category.items.find(i => i.name === 'Cough Medicines')
    };
  }
  
  if (name.includes('epsom salt') || name.includes('dr. teal')) {
    const category = categories.find(c => c.name === 'Home Health Care');
    return {
      category,
      item: category.items.find(i => i.name === 'Braces & Supports')
    };
  }
  
  if (name.includes('alka-seltzer') && !name.includes('cold') && !name.includes('flu')) {
    const category = categories.find(c => c.name === 'Digestive Health');
    return {
      category,
      item: category.items.find(i => i.name === 'Antacids')
    };
  }
  
  if (name.includes('dramamine') || name.includes('motion sickness')) {
    const category = categories.find(c => c.name === 'Digestive Health');
    return {
      category,
      item: category.items.find(i => i.name === 'Anti-Diarrheal')
    };
  }
  
  if (name.includes('unisom') || name.includes('sleep')) {
    const category = categories.find(c => c.name === "Children's Wellness");
    return {
      category,
      item: category.items.find(i => i.name === 'Sleep Support')
    };
  }
  
  return null;
}

async function migrateCategories() {
    const script = new ScriptRunner({ name: 'Migrate Categories' });
    const dbManager = new DatabaseOperationManager();
    const validator = new DataValidationManager();
    const verifier = new VerificationManager();

    await script.execute(async () => {
        // Validate categories structure
        await validator.validate('categories', categories);

        // Verify category data integrity
        await verifier.verify('category', { categories });

        return dbManager.withCursor({
            model: Product,
            batchSize: 50,
            operation: async (product, session) => {
                const result = determineCategory(product);
                if (!result?.category) {
                    return 'skipped';
                }

                const { category, item } = result;
                if (!category.slug || !item?.slug) {
                    throw new Error(`Invalid category/item slugs for ${product.name}`);
                }

                await Product.findByIdAndUpdate(
                    product._id,
                    {
                        $set: {
                            category: category.name,
                            categorySlug: category.slug,
                            item: item.name,
                            itemSlug: item.slug,
                            categoryPath: `${category.name} > ${item.name}`,
                            updatedAt: new Date()
                        }
                    },
                    { session, runValidators: true }
                );
                return 'updated';
            }
        });
    });
}

console.log('Starting category migration...');
migrateCategories().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 
