import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { orderIds, status } = await request.json();
    
    if (!orderIds?.length || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status } }
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} orders`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      { error: 'Failed to update orders' },
      { status: 500 }
    );
  }
} 