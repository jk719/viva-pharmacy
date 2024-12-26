import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await Promise.resolve(params);

    // Add validation for missing ID
    if (!id) {
      console.log('No product ID provided');
      return NextResponse.json({ 
        success: false, 
        message: 'No product ID provided',
        products: [] 
      }, { status: 400 });
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid product ID format:', id);
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid product ID format',
        products: [] 
      }, { status: 400 });
    }

    const product = await Product.findById(id);
    
    console.log('Product fetch result:', {
      id,
      found: !!product,
      productId: product?._id
    });

    if (!product) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product not found',
        products: [] 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      products: [product]
    });

  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to fetch product',
      products: [] 
    }, { status: 500 });
  }
} 