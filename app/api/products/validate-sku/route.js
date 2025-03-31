import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import getProductModel from '@/models/Product';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');
    
    if (!sku) {
      return NextResponse.json({ error: 'SKU parameter is required' }, { status: 400 });
    }
    
    await dbConnect();
    const Product = getProductModel();
    
    const existingProduct = await Product.findOne({ sku });
    
    return NextResponse.json({ 
      exists: !!existingProduct,
      message: existingProduct ? 'SKU already exists' : 'SKU is available'
    });
  } catch (error) {
    console.error('Error validating SKU:', error);
    return NextResponse.json({ error: 'Failed to validate SKU' }, { status: 500 });
  }
} 