import { connectToDatabase } from '../lib/dbConnect';
import Product from '../models/Product';
import { categories } from '../data/categories';

const dosageFormMap = {
  'Other': 'Other',
  'Cream': 'Cream',
  'Liquid': 'Liquid',
  'Syrup': 'Liquid',
  'Drops': 'Drops',
  'Gummies': 'Gummies',
  'Spray': 'Spray'
};

async function migrateProducts() {
  try {
    await connectToDatabase();
    const products = await Product.find({});
    
    for (const product of products) {
      // Add new fields with default values
      const updates = {
        isPopular: product.isFeatured, // Use featured as initial popularity indicator
        isNew: false,
        contraindications: [],
        sideEffects: [],
        storage: "Store at room temperature",
        activeIngredients: product.activeIngredients || []
      };

      // Map dosage form to new enum values
      if (product.dosageForm) {
        updates.dosageForm = dosageFormMap[product.dosageForm] || 'Other';
      }

      await Product.updateOne(
        { _id: product._id },
        { $set: updates }
      );
    }

    console.log('Products migrated successfully');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateProducts(); 