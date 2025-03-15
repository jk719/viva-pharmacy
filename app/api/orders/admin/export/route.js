import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { orderIds } = await request.json();
    
    if (!orderIds?.length) {
      return NextResponse.json(
        { error: 'No orders selected' },
        { status: 400 }
      );
    }

    await dbConnect();

    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate('userId', 'email name')
      .lean();

    // Create CSV content
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Status',
      'Total',
      'Payment Status',
      'Delivery Method',
      'Items'
    ].join(',');

    const rows = orders.map(order => [
      order.orderNumber,
      new Date(order.createdAt).toISOString(),
      order.userId?.name || 'N/A',
      order.userId?.email || 'N/A',
      order.status,
      order.total.toFixed(2),
      order.paymentStatus,
      order.deliveryMethod,
      `"${order.items.map(item => `${item.name} (${item.quantity})`).join('; ')}"`
    ].join(','));

    const csv = [headers, ...rows].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=orders-export-${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error) {
    console.error('Error in export:', error);
    return NextResponse.json(
      { error: 'Failed to export orders' },
      { status: 500 }
    );
  }
} 