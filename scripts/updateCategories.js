import { connectToDatabase } from '../lib/dbConnect';
import Product from '../models/Product';
import { categories } from '../data/categories';

const categoryMappings = {
  // Map current categories to new ones
  'Monistat 3 Vaginal Antifungal': {
    category: 'Medications',
    subcategory: 'Women\'s Health',
    item: 'Antifungal'
  },
  'NeilMed Sinus Rinse': {
    category: 'Medications',
    subcategory: 'Cold & Flu',
    item: 'Nasal Care'
  },
  'BAND-AID': {
    category: 'First Aid',
    subcategory: 'Wound Care',
    item: 'Bandages'
  },
  // Add more mappings based on your products
};

async function updateCategories() {
  try {
    await connectToDatabase();
    
    const products = await Product.find({});
    
    for (const product of products) {
      // Find the appropriate mapping based on product name or current category
      const mapping = findMapping(product.name, categoryMappings);
      
      if (mapping) {
        await Product.updateOne(
          { _id: product._id },
          {
            $set: {
              category: mapping.category,
              subcategory: mapping.subcategory,
              item: mapping.item,
              categorySlug: generateSlug(mapping.category),
              subcategorySlug: generateSlug(mapping.subcategory),
              itemSlug: generateSlug(mapping.item)
            }
          }
        );
      }
    }
    
    console.log('Categories updated successfully');
  } catch (error) {
    console.error('Error updating categories:', error);
  }
} 