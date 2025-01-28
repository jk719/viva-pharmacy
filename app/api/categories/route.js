import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { categories } from '@/data/categories';

export async function GET() {
  try {
    // Ensure DB connection
    await dbConnect();
    
    // Get categories from our static definition
    const staticCategories = categories.map(cat => cat.name);
    console.log('Static categories:', staticCategories);
    
    // Find all distinct categories from products
    const dbCategories = await Product.distinct('category');
    console.log('DB categories found:', dbCategories);
    
    // Merge both sets and add "All"
    const mergedCategories = ["All", ...new Set([...staticCategories, ...dbCategories])]
      .filter(category => category && category.length > 0);
    
    console.log('Final categories list:', mergedCategories);

    if (!mergedCategories || mergedCategories.length === 0) {
      throw new Error('No categories found');
    }
    
    return NextResponse.json(mergedCategories);
  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(["All"], { status: 500 });
  }
} 