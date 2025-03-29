import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import getProductModel from '@/models/Product';
import { authOptions } from '@/lib/auth';

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
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