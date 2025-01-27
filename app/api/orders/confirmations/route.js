import { NextResponse } from 'next/server';
import { generateOrderConfirmationEmail } from '@/lib/email-templates/order-confirmation.mjs';
import { sendOrderConfirmationEmail } from '@/lib/email/sendEmail.mjs';

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      orderNumber,
      email,
      items = [],
      subtotal,
      tax,
      total,
      shippingAddress,
      deliveryMethod,
      selectedTime,
      vivaBucksEarned = 0,
      rewardPointsEarned = 0,
      customerName = 'Valued Customer'
    } = data;

    // Log initial request
    console.log('📦 Received order confirmation request:', {
      hasSession: !!email,
      userEmail: email?.replace(/@.*$/, '@...'),
      orderData: { 
        orderNumber, 
        total, 
        itemCount: items.length,
        subtotal,
        tax
      }
    });

    // Add more detailed logging for items
    console.log('📧 Processing email data:', {
      orderNumber,
      items: items.map(item => ({
        name: item.name,
        hasImage: !!item.image,
        imageUrl: item.image?.substring(0, 50) + '...',
        price: item.price,
        quantity: item.quantity
      })),
      totals: { subtotal, tax, total }
    });

    // Format items with proper validation and calculations
    const formattedItems = items.map(item => {
      const itemPrice = parseFloat(item.price || 0);
      const itemQuantity = parseInt(item.quantity || 1);
      return {
        name: item.name || item.title || 'Product',
        price: itemPrice,
        quantity: itemQuantity,
        image: item.image || null,
        subtotal: (itemPrice * itemQuantity)
      };
    });

    // Calculate totals if not provided
    const calculatedSubtotal = formattedItems.reduce((sum, item) => 
      sum + item.subtotal, 0
    );

    const calculatedTax = tax ? parseFloat(tax) : (calculatedSubtotal * 0.08875);
    const calculatedTotal = total ? parseFloat(total) : (calculatedSubtotal + calculatedTax);

    // Generate email data
    const emailData = {
      orderNumber,
      customerName,
      items: formattedItems,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: calculatedTotal,
      shippingAddress,
      deliveryMethod,
      selectedTime,
      vivaBucksEarned: parseFloat(vivaBucksEarned),
      rewardPointsEarned: parseInt(rewardPointsEarned)
    };

    console.log('✅ Email template generated successfully');

    // Send email
    await sendOrderConfirmationEmail(
      email,
      emailData
    );

    return NextResponse.json({ 
      success: true,
      data: {
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        total: calculatedTotal
      }
    });

  } catch (error) {
    console.error('❌ Order confirmation error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to send order confirmation' },
      { status: 500 }
    );
  }
}
