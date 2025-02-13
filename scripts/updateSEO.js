import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from 'slugify';
import { categories } from '../data/categories.js';

dotenv.config({ path: '.env.local' });

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  item: String,
  itemSlug: String,
  categorySlug: String,
  price: Number,
  stock: Number,
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    canonical: String,
    breadcrumbs: [{
      name: String,
      url: String
    }],
    structuredData: mongoose.Schema.Types.Mixed
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const generateSEOData = (product, category) => {
  const subcategory = category?.items?.find(item => item.slug === product.itemSlug);
  
  return {
    metaTitle: `${product.name} | ${category?.name || 'Medicine'} | GoVivanova Pharmacy`,
    metaDescription: `${product.shortDescription || product.description?.substring(0, 150)}. Available at GoVivanova Pharmacy. Fast delivery!`,
    metaKeywords: [
      product.name,
      category?.name,
      subcategory?.name,
      product.dosageForm,
      'pharmacy',
      'medicine',
      'online pharmacy',
      'healthcare'
    ].filter(Boolean),
    canonical: `/${category?.slug || 'medicine'}/${subcategory?.slug || 'general'}/${product.itemSlug}`,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: category?.name || 'Medicine', url: `/${category?.slug || 'medicine'}` },
      { name: subcategory?.name || 'General', url: `/${category?.slug || 'medicine'}/${subcategory?.slug || 'general'}` },
      { name: product.name, url: `/${category?.slug || 'medicine'}/${subcategory?.slug || 'general'}/${product.itemSlug}` }
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
      category: category?.name,
      sku: product.sku,
      image: `https://res.cloudinary.com/your-cloud-name/image/upload/${product.imageKey}`,
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "USD",
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "GoVivanova Pharmacy"
        }
      }
    }
  };
};

async function updateSEO() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products to update`);

    let updated = 0;
    let errors = 0;

    for (const product of products) {
      try {
        const category = categories.find(c => c.slug === product.categorySlug);
        const seoData = generateSEOData(product, category);

        await Product.findByIdAndUpdate(product._id, {
          $set: { seo: seoData }
        }, { runValidators: true });

        updated++;
        console.log(`Updated SEO for product ${updated}/${products.length}`);
      } catch (error) {
        console.error(`Error updating product ${product._id}:`, error);
        errors++;
      }
    }

    console.log('\nUpdate Summary:');
    console.log('---------------');
    console.log(`Total products: ${products.length}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed updates: ${errors}`);

  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

updateSEO(); 