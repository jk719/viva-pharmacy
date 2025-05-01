import { NextResponse } from 'next/server';
import Order from '@/models/Order';
import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
  try {
    // Get order ID from query parameters
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId parameter' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Check if order exists and has loyalty points processed
    // Updated query to primarily use paymentIntentId if available from success page
    // but fall back to orderNumber if needed.
    const order = await Order.findOne({ 
      $or: [
        { paymentIntentId: orderId }, 
        { orderNumber: orderId } 
      ]
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found', processed: false },
        { status: 404 }
      );
    }
    
    // Return success status and whether points were processed by webhook
    return NextResponse.json({
      success: true,
      processed: !!order.loyaltyPointsProcessed, // Check the flag set by webhook
      orderId: order._id.toString(), // Return DB ID
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus
    });
  } catch (error) {
    console.error('Error checking order status:', error);
    return NextResponse.json(
      { error: 'Failed to check order status', processed: false },
      { status: 500 }
    );
  }
}
