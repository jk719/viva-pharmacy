import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import getProductModel from '@/models/Product';

export async function GET() {
  try {
    const conn = await dbConnect();
    
    // Ensure connection is ready
    if (conn.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const Product = getProductModel();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({
      success: true,
      products: products.map(product => ({
        _id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory,
        item: product.item,
        categoryPath: product.categoryPath,
        isInStock: product.stock > 0,
        isNew: product.isNewProduct,
        stock: product.stock,
        activeIngredients: product.activeIngredients,
        dosageForm: product.dosageForm
      }))
    });
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 