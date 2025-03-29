import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import getProductModel from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const Product = getProductModel();

    // Get all products with edit history
    const products = await Product.find({ 'editHistory.0': { $exists: true } })
      .select('name editHistory')
      .sort({ 'editHistory.timestamp': -1 })
      .limit(20);

    // Transform the data to match the expected format
    const edits = products.flatMap(product => 
      product.editHistory.map(edit => ({
        productId: product._id,
        productName: product.name,
        editedBy: edit.editedBy,
        timestamp: edit.timestamp,
        changes: edit.changes
      }))
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20);

    return NextResponse.json({ 
      success: true, 
      edits 
    });

  } catch (error) {
    console.error('Error fetching recent edits:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recent edits' },
      { status: 500 }
    );
  }
} 