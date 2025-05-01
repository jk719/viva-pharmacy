import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Removed
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
// import { authOptions } from '@/lib/auth'; // Removed
import { sendOrderStatusUpdate } from '@/lib/email/orderNotifications';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed'];

export async function GET(request, context) {
  const token = request.nextauth?.token; // Added

  // Use token for authorization
  if (!token || !token.role || !['ADMIN', 'MANAGER'].includes(token.role)) { // Modified
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // const session = await getServerSession(authOptions); // Removed
    // if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) { // Removed
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); // Removed
    // } // Removed

    const orderId = await Promise.resolve(context.params).then(p => p.id);
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId)
      .populate('userId', 'email name')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...order,
      id: order._id.toString()
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  const token = request.nextauth?.token; // Added

  // Use token for authorization
  if (!token || !token.role || !['ADMIN', 'MANAGER'].includes(token.role)) { // Modified
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // const session = await getServerSession(authOptions); // Removed
    // if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) { // Removed
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); // Removed
    // } // Removed

    const orderId = await Promise.resolve(context.params).then(p => p.id);
    const body = await request.json();
    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update allowed fields
    if (body.status && ORDER_STATUSES.includes(body.status)) {
      const previousStatus = order.status;
      order.status = body.status;
      await order.save();
      
      // Send notification if status changed
      if (previousStatus !== body.status) {
        try {
          await sendOrderStatusUpdate(order, body.status);
        } catch (error) {
          console.error('Error sending status update email:', error);
          // Continue with the status update even if email fails
        }
      }

      return NextResponse.json({ 
        message: 'Order status updated successfully',
        order 
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 