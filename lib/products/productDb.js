import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import getProductModel from '@/models/Product';

export async function addProduct(productData) {
  try {
    await dbConnect();
    const Product = getProductModel();
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
    await dbConnect();
    const Product = getProductModel();
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

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
    await dbConnect();
    const Product = getProductModel();
    
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
    await dbConnect();
    const Product = getProductModel();
    const query = category && category !== 'All' 
      ? { category }
      : {};
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    return products.map(product => ({
      ...product.toObject(),
      category: product.category,
      item: product.item || product.subcategory
    }));
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    throw error;
  }
}

export async function getFeaturedProducts() {
  try {
    await dbConnect();
    const Product = getProductModel();
    return await Product.find({ isFeatured: true }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    throw error;
  }
}

export async function searchProducts(searchTerm) {
  try {
    await dbConnect();
    const Product = getProductModel();
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