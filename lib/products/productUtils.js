import mongoose from 'mongoose';
import Product from '../../models/Product';

export async function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
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

  // Validate image URL
  try {
    new URL(product.image);
  } catch {
    if (!product.image.startsWith('/')) {
      throw new Error('Image must be a valid URL or start with /');
    }
  }

  return true;
}

export async function addProduct(productData) {
  try {
    await validateProduct(productData);
    
    const product = new Product({
      ...productData,
      price: parseFloat(productData.price),
      isFeatured: Boolean(productData.isFeatured),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await product.save();
    return product;
  } catch (error) {
    console.error('Error in addProduct:', error);
    throw error;
  }
}

export async function updateProduct(productId, updates) {
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Validate updates
    if (updates.price) {
      updates.price = parseFloat(updates.price);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { 
        ...updates,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    return updatedProduct;
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
}

export async function deleteProduct(productId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }

    const result = await Product.findByIdAndDelete(productId);
    if (!result) {
      throw new Error('Product not found');
    }

    return result;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
}

export async function getProductsByCategory(category) {
  try {
    const query = category && category !== 'All' 
      ? { category } 
      : {};
    
    return await Product.find(query).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    throw error;
  }
}

export async function getFeaturedProducts() {
  try {
    return await Product.find({ isFeatured: true }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    throw error;
  }
}

export async function searchProducts(searchTerm) {
  try {
    return await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error in searchProducts:', error);
    throw error;
  }
}

export function getImageUrl(image) {
  if (image.startsWith('http')) {
    return image;
  }
  return `/images/products/${image}`;
}

export function sanitizeProduct(product) {
  return {
    _id: product._id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    category: product.category,
    image: getImageUrl(product.image),
    isFeatured: Boolean(product.isFeatured),
    ingredients: product.ingredients || '',
    directions: product.directions || '',
    warnings: product.warnings || '',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}