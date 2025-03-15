import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    const orders = await Order.find()
      .populate('userId', 'email name')
      .sort({ createdAt: -1 })
      .lean();

    // Transform the orders to ensure all required fields are present
    const transformedOrders = orders.map(order => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber || 'N/A',
      userId: {
        name: order.userId?.name || 'N/A',
        email: order.userId?.email || 'N/A'
      },
      status: order.status || 'Pending',
      total: order.total || 0,
      createdAt: order.createdAt || new Date(),
      items: order.items || [],
      deliveryMethod: order.deliveryMethod,
      paymentStatus: order.paymentStatus
    }));

    return NextResponse.json({
      success: true,
      orders: transformedOrders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 