const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

// Define the schema directly in the script
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  categoryTagline: String,
  item: String,
  categoryPath: String,
  categorySlug: String,
  itemSlug: String,
  isFeatured: Boolean,
  stock: Number
});

async function migrateChildrensCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create the model with a minimal schema
    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

    // Find all products in the old category
    const products = await Product.find({ 
      categorySlug: "childrens-wellness"
    });

    console.log(`Found ${products.length} products to migrate`);

    // Update each product
    for (const product of products) {
      await Product.findByIdAndUpdate(product._id, {
        category: "Children's Medicine & Wellness",
        categorySlug: "childrens-medicine-wellness",
        subcategory: "Children's Medicine & Wellness",
        subcategorySlug: "childrens-medicine-wellness",
        categoryTagline: "Children's Care"
      });
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

migrateChildrensCategories(); 