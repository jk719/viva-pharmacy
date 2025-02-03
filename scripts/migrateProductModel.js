import { connectToDatabase } from '../lib/dbConnect';
import Product from '../models/Product';
import { categories } from '../data/categories';
import mongoose from 'mongoose';
import { ScriptRunner } from './utils/scriptRunner.js';
import { DatabaseOperationManager } from './utils/databaseOperationManager.js';
import { DataValidationManager } from './utils/dataValidationManager.js';
import { SessionManager } from './utils/sessionManager.js';

const dosageFormMap = {
  'tablet': 'Tablet',
  'capsule': 'Capsule',
  'liquid': 'Liquid',
  'cream': 'Cream',
  'gel': 'Gel',
  'spray': 'Spray',
  'Other': 'Other',
  'Drops': 'Drops',
  'Gummies': 'Gummies',
  'Syrup': 'Liquid'
};

async function migrateProducts() {
  const script = new ScriptRunner({ name: 'Migrate Product Model' });
  const dbManager = new DatabaseOperationManager();
  const validator = new DataValidationManager();
  const sessionManager = new SessionManager();

  await script.execute(async () => {
    // Validate dosage form mappings
    await validator.validate('dosageFormMap', dosageFormMap);

    return dbManager.withCursor({
      model: Product,
      batchSize: 50,
      select: '_id isFeatured dosageForm activeIngredients',
      operation: async (product, session) => {
        const newDosageForm = dosageFormMap[product.dosageForm] || 'Other';
        
        await Product.findByIdAndUpdate(
          product._id,
          {
            $set: {
              dosageForm: newDosageForm,
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

migrateProducts(); 