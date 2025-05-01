import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import getProductModel from '@/models/Product';
import { authOptions } from '@/lib/auth';

export async function GET(request, context) {
  try {
    // Middleware might not protect this specific GET path, so we check auth and role here.
    const token = request.nextauth?.token;
    if (!token?.role || !['ADMIN', 'MANAGER'].includes(token.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const Product = getProductModel();
    const { id } = context.params;

    const product = await Product.findById(id).select('editHistory');
    
    return NextResponse.json({
      success: true,
      history: product.editHistory || []
    });
  } catch (error) {
    console.error('Error fetching edit history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch edit history' },
      { status: 500 }
    );
  }
} 