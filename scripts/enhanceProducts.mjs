import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import slugify from 'slugify';
import { categories } from '../data/categories.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  item: String,
  itemSlug: String,
  categorySlug: String,
  isFeatured: Boolean,
  stock: Number,
  dosageForm: String,
  // ... add other fields as needed
});

// Initialize Product model
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const generateSKU = (category, index) => {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}-${String(index).padStart(4, '0')}`;
};

const generateMetaTitle = (name, category) => {
  return `${name} | ${category} | GoVivanova Pharmacy`;
};

const generateMetaDescription = (shortDesc) => {
  return `${shortDesc}. Available at GoVivanova Pharmacy. Shop now for fast delivery!`;
};

const generateCanonical = (category, subcategory, itemSlug) => {
  return `/${slugify(category.toLowerCase())}/${slugify(subcategory.toLowerCase())}/${itemSlug}`;
};

async function enhanceProducts() {
  try {
    await connectToDatabase();
    
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products to update`);
    
    let updated = 0;
    
    for (const product of products) {
      try {
        // Find category and subcategory
        const category = categories.find(c => c.name === product.category);
        if (!category) {
          console.warn(`Category not found for product ${product._id}: ${product.category}`);
          continue;
        }

        const subcategoryIndex = category?.items.findIndex(item => item.slug === product.itemSlug) ?? 0;
        
        // Generate enhanced product data
        const enhancedProduct = {
          shortDescription: product.description?.substring(0, 150) + '...' || '',
          imageKey: product.image?.split('/').pop().replace('.png', '') || '',
          subcategoryIndex,
          keywords: [product.category, product.item, product.dosageForm].filter(Boolean),
          sku: generateSKU(product.category, updated),
          tagline: category?.tagline || '',
          
          seo: {
            metaTitle: generateMetaTitle(product.name, product.category),
            metaDescription: generateMetaDescription(product.description?.substring(0, 150) || ''),
            metaKeywords: [product.category, product.item, product.dosageForm].filter(Boolean),
            canonical: generateCanonical(product.category, category?.items[subcategoryIndex]?.name, product.itemSlug),
            breadcrumbs: [
              { name: 'Home', url: '/' },
              { name: product.category, url: `/${slugify(product.category.toLowerCase())}` },
              { name: category?.items[subcategoryIndex]?.name, url: `/${slugify(product.category.toLowerCase())}/${slugify(category?.items[subcategoryIndex]?.name.toLowerCase())}` },
              { name: product.name, url: generateCanonical(product.category, category?.items[subcategoryIndex]?.name, product.itemSlug) }
            ],
            structuredData: {
              "@context": "https://schema.org/",
              "@type": "Product",
              name: product.name,
              description: product.description,
              brand: {
                "@type": "Brand",
                name: product.item
              },
              category: product.category,
              sku: generateSKU(product.category, updated),
              image: product.image,
              offers: {
                "@type": "Offer",
                price: product.price,
                priceCurrency: "USD",
                availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
              },
              medicineSystem: "http://schema.org/OTC"
            }
          }
        };

        // Update the product
        await Product.findByIdAndUpdate(product._id, {
          $set: enhancedProduct
        }, { runValidators: true });

        updated++;
        console.log(`Updated ${updated}/${products.length} products`);
      } catch (error) {
        console.error(`Error updating product ${product._id}:`, error);
      }
    }

    console.log(`Successfully enhanced ${updated} products`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

enhanceProducts(); 