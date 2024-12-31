import { NextResponse } from 'next/server';
import { getCategories } from '@/app/categories';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(["All"], { status: 500 });
  }
} 