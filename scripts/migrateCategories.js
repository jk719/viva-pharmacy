import dbConnect from '../lib/dbConnect';
import Product from '../models/Product';
import { categories } from '../data/categories';

async function migrateCategories() {
  try {
    await dbConnect();
    
    const products = await Product.find({});
    
    for (const product of products) {
      // Skip if already migrated
      if (product.categorySlug && product.subcategorySlug && product.itemSlug) {
        continue;
      }

      // Find matching category structure
      let categorySlug, subcategorySlug, itemSlug;
      
      for (const category of categories) {
        for (const subcategory of category.subcategories) {
          for (const item of subcategory.items) {
            if (item.name === product.category) {
              categorySlug = category.slug;
              subcategorySlug = subcategory.slug;
              itemSlug = item.slug;
              break;
            }
          }
          if (categorySlug) break;
        }
        if (categorySlug) break;
      }

      if (!categorySlug) {
        console.log(`Could not find category match for product: ${product.name}`);
        continue;
      }

      // Update product
      await Product.findByIdAndUpdate(product._id, {
        categorySlug,
        subcategorySlug,
        itemSlug
      });

      console.log(`Updated product: ${product.name}`);
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateCategories(); 