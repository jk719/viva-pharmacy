import fs from 'fs/promises';
import path from 'path';

export async function addProductToFile(newProduct) {
  try {
    const productsPath = path.join(process.cwd(), 'src', 'data', 'products.js');
    const fileContent = await fs.readFile(productsPath, 'utf8');
    
    // Extract the products array content
    const match = fileContent.match(/const products = \[([\s\S]*?)\];/);
    if (!match) {
      throw new Error('Could not parse products file');
    }
    
    // Split the content into individual product objects
    const productsStr = match[1];
    const productObjects = productsStr.split(/},\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => p.endsWith('}') ? p : p + '}');
    
    // Parse each product object
    const currentProducts = productObjects.map(productStr => {
      // Extract values using regex with better string handling
      const id = parseInt(productStr.match(/id:\s*(\d+)/)?.[1] || '0');
      const name = productStr.match(/name:\s*'((?:[^'\\]|\\.)*?)'/)?.[1] || '';
      const image = productStr.match(/image:\s*'([^']+)'/)?.[1] || '';
      const price = parseFloat(productStr.match(/price:\s*([\d.]+)/)?.[1] || '0');
      const description = productStr.match(/description:\s*'((?:[^'\\]|\\.)*?)'/)?.[1] || '';
      const category = productStr.match(/category:\s*'([^']+)'/)?.[1] || '';
      const isFeatured = productStr.includes('isFeatured: true');
      
      return { id, name, image, price, description, category, isFeatured };
    });
    
    // Generate new ID
    const newId = Math.max(...currentProducts.map(p => p.id)) + 1;
    
    // Create new product object
    const productToAdd = {
      id: newId,
      ...newProduct,
      price: parseFloat(newProduct.price),
      isFeatured: Boolean(newProduct.isFeatured)
    };

    // Add new product to array
    const updatedProducts = [...currentProducts, productToAdd];
    
    // Create new file content with proper string escaping
    const newFileContent = `// src/data/products.js
const products = [
${updatedProducts.map(p => `  { 
    id: ${p.id}, 
    name: '${escapeString(p.name)}', 
    image: '${escapeString(p.image)}', 
    price: ${p.price}, 
    description: '${escapeString(p.description)}', 
    category: '${escapeString(p.category)}', 
    isFeatured: ${p.isFeatured} 
  }`).join(',\n')}
];
export default products;`;

    await fs.writeFile(productsPath, newFileContent, 'utf8');
    return productToAdd;
    
  } catch (error) {
    console.error('Error in addProductToFile:', error);
    throw error;
  }
}

// Helper function to properly escape strings
function escapeString(str) {
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/'/g, "\\'")    // Escape single quotes
    .replace(/\r?\n/g, ' ')  // Replace newlines with spaces
    .replace(/\t/g, ' ')     // Replace tabs with spaces
    .trim();                 // Remove leading/trailing whitespace
}

export async function validateProduct(product) {
  const requiredFields = ['name', 'description', 'price', 'category', 'image'];
  const missingFields = requiredFields.filter(field => !product[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
    throw new Error('Price must be a positive number');
  }

  if (!product.image.startsWith('/images/products/')) {
    throw new Error('Image path must start with /images/products/');
  }

  return true;
}