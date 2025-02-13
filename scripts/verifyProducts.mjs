import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const productSchema = new mongoose.Schema({
  name: String,
  shortDescription: String,
  description: String,
  price: Number,
  imageKey: String,
  category: String,
  subcategoryIndex: Number,
  item: String,
  itemSlug: String,
  sku: String,
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    canonical: String,
    breadcrumbs: [{
      name: String,
      url: String
    }]
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function verifyProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({}).lean();
    console.log(`\nFound ${products.length} products\n`);

    // Verification checks
    const checks = {
      hasShortDescription: 0,
      hasImageKey: 0,
      hasSKU: 0,
      hasValidSEO: 0,
      hasValidBreadcrumbs: 0
    };

    const issues = [];

    products.forEach((product, index) => {
      if (product.shortDescription) checks.hasShortDescription++;
      if (product.imageKey) checks.hasImageKey++;
      if (product.sku) checks.hasSKU++;
      if (product.seo?.metaTitle && product.seo?.metaDescription) checks.hasValidSEO++;
      if (product.seo?.breadcrumbs?.length === 4) checks.hasValidBreadcrumbs++;

      // Check for potential issues
      if (!product.shortDescription) {
        issues.push(`Product ${product._id}: Missing short description`);
      }
      if (!product.sku) {
        issues.push(`Product ${product._id}: Missing SKU`);
      }
      if (!product.seo?.metaTitle) {
        issues.push(`Product ${product._id}: Missing SEO meta title`);
      }
    });

    // Print summary
    console.log('Verification Summary:');
    console.log('-------------------');
    console.log(`Total Products: ${products.length}`);
    console.log(`Products with short description: ${checks.hasShortDescription}`);
    console.log(`Products with image key: ${checks.hasImageKey}`);
    console.log(`Products with SKU: ${checks.hasSKU}`);
    console.log(`Products with valid SEO: ${checks.hasValidSEO}`);
    console.log(`Products with valid breadcrumbs: ${checks.hasValidBreadcrumbs}`);

    if (issues.length > 0) {
      console.log('\nIssues Found:');
      console.log('-------------');
      issues.forEach(issue => console.log(issue));
    } else {
      console.log('\nNo issues found! All products are properly enhanced.');
    }

    // Sample output of first product
    console.log('\nSample Product:');
    console.log('-------------');
    console.log(JSON.stringify(products[0], null, 2));

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

verifyProducts(); 