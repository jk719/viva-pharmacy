import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET() {
  try {
    // Ensure DB connection
    await dbConnect();
    
    // Find all distinct categories
    const distinctCategories = await Product.distinct('category');
    console.log('Distinct categories found:', distinctCategories);
    
    // Add "All" and filter out any empty values
    const categories = ["All", ...distinctCategories].filter(category => 
      category && category.length > 0
    );
    
    console.log('Final categories list:', categories);

    if (!categories || categories.length === 0) {
      throw new Error('No categories found');
    }
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(["All"], { status: 500 });
  }
} 