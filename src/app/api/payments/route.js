import { NextResponse } from 'next/server';
import { cloverService } from '@/lib/clover/service';

export async function POST(request) {
  try {
    const { items, total } = await request.json();

    // Create order in Clover
    const order = await cloverService.createOrder(items);

    // Process payment
    const payment = await cloverService.createPayment(order.id, total);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentId: payment.id
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
