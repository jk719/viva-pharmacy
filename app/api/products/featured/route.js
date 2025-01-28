import { NextResponse } from 'next/server';
import { getFeaturedProducts } from '@/lib/products/productDb';

export async function GET() {
  try {
    const products = await getFeaturedProducts();
    return NextResponse.json({ 
      success: true, 
      products 
    });
  } catch (error) {
    console.error('Featured Products API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
} 