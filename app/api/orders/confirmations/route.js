import { NextResponse } from 'next/server';
import { generateOrderConfirmationEmail } from '@/lib/email-templates/order-confirmation';
import { sendOrderConfirmationEmail } from '@/lib/email/sendEmail';
import { eventEmitter, Events, paymentTracker } from '@/lib/eventEmitter';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const data = await request.json();
    
    // Format all numerical values immediately
    const formattedData = {
      orderNumber: data.orderNumber,
      email: data.email,
      items: data.items.map(item => ({
        name: item.name,
        price: parseFloat(item.price || 0).toFixed(2),
        quantity: parseInt(item.quantity || 1),
        image: item.image,
        hasImage: !!item.image,
        subtotal: (parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)
      })),
      subtotal: parseFloat(data.subtotal || 0).toFixed(2),
      tax: parseFloat(data.tax || 0).toFixed(2),
      total: parseFloat(data.total || 0).toFixed(2),
      shippingAddress: data.shippingAddress,
      deliveryMethod: data.deliveryMethod,
      selectedTime: data.selectedTime,
      vivaBucksEarned: parseFloat(data.vivaBucksEarned || 0).toFixed(2),
      rewardPointsEarned: parseInt(data.rewardPointsEarned || 0),
      customerName: data.customerName || session?.user?.name || 'Valued Customer'
    };

    // Log formatted data
    console.log('📦 Received order confirmation request:', {
      hasSession: !!session,
      userEmail: formattedData.email?.replace(/@.*$/, '@...'),
      userId: session?.user?.id,
      orderData: {
        orderNumber: formattedData.orderNumber,
        total: parseFloat(formattedData.total),
        itemCount: formattedData.items.length,
        subtotal: parseFloat(formattedData.subtotal),
        tax: parseFloat(formattedData.tax)
      }
    });

    // Generate email with formatted data
    const emailData = {
      ...formattedData,
      items: formattedData.items.map(item => ({
        ...item,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal)
      }))
    };

    await sendOrderConfirmationEmail(formattedData.email, emailData);

    // Emit events with formatted numbers
    if (session?.user?.id) {
      const amount = parseFloat(formattedData.total);
      if (amount > 0) {
        eventEmitter.emit(Events.PAYMENT_COMPLETED, {
          userId: session.user.id,
          paymentIntentId: formattedData.orderNumber,
          amount,
          animate: true,
          timestamp: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        subtotal: parseFloat(formattedData.subtotal),
        tax: parseFloat(formattedData.tax),
        total: parseFloat(formattedData.total),
        vivaBucksEarned: parseFloat(formattedData.vivaBucksEarned),
        rewardPointsEarned: formattedData.rewardPointsEarned
      }
    });

  } catch (error) {
    console.error('❌ Order confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to send order confirmation' },
      { status: 500 }
    );
  }
}
