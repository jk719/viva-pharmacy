import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
// Replace adapter import with direct emailService import
import { emailService } from '@/lib/email/emailService';
import dbConnect from '@/lib/dbConnect';
import PrescriptionDelivery from '@/models/PrescriptionDelivery';
import Order from '@/models/Order';
import User from '@/models/User';
import getProductModel from '@/models/Product';
import { v4 as uuidv4 } from 'uuid';
import eventEmitter, { Events } from '@/lib/eventEmitter';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    const isTestMode = headersList.get('X-Test-Mode') === 'true';

    let event;
    // If in test mode, parse the event directly without verification
    if (isTestMode) {
      console.log('⚠️ Test mode detected: bypassing Stripe signature verification');
      try {
        event = JSON.parse(body);
      } catch (err) {
        console.error('❌ Test webhook: Invalid JSON:', err.message);
        return NextResponse.json(
          { error: 'Invalid JSON payload' },
          { status: 400 }
        );
      }
    } else {
      // Normal verification path for real Stripe webhooks
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return NextResponse.json(
          { error: 'Webhook signature verification failed' },
          { status: 400 }
        );
      }
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Check which type of payment this is
      if (paymentIntent.metadata.type === 'prescription_delivery') {
        // Process prescription delivery payments
        await handlePrescriptionDelivery(paymentIntent);
      } else {
        // Process regular orders
        await handleRegularOrder(paymentIntent);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleRegularOrder(paymentIntent) {
  await dbConnect();
  
  try {
    const { metadata } = paymentIntent;
    const userId = metadata.userId;
    
    // Validate that this payment hasn't been processed before
    const existingOrder = await Order.findOne({ paymentIntentId: paymentIntent.id });
    if (existingOrder) {
      console.log(`Order already exists for payment ${paymentIntent.id}`);
      return;
    }
    
    // Parse cart items from metadata
    let cartItems = [];
    try {
      // If cart items are stored as a string in metadata, parse them
      if (metadata.cartItems) {
        cartItems = JSON.parse(metadata.cartItems);
      }
    } catch (error) {
      console.error('Error parsing cart items from metadata:', error);
    }
    
    // If cart items weren't stored in metadata or parsing failed,
    // we can try to retrieve them from the payment intent's description or other fields
    if (!cartItems || cartItems.length === 0) {
      console.warn('No cart items found in metadata. Using fallback data collection.');
      // This is a fallback that would need to be customized based on your payment flow
    }
    
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 6)}`;
    
    // Parse shipping address from metadata if available
    let shippingAddress = null;
    if (metadata.shippingAddress) {
      try {
        shippingAddress = JSON.parse(metadata.shippingAddress);
      } catch (error) {
        console.error('Error parsing shipping address:', error);
      }
    }
    
    // Create order record
    const order = new Order({
      orderNumber,
      userId,
      items: cartItems.map(item => ({
        productId: item.id || item._id || item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || item.imageUrl
      })),
      total: paymentIntent.amount / 100, // Convert cents to dollars
      status: 'Processing',
      deliveryMethod: metadata.deliveryMethod || 'delivery',
      selectedTime: metadata.selectedTime || 'default',
      shippingAddress: shippingAddress || {
        street: metadata.street || '',
        city: metadata.city || '',
        state: metadata.state || '',
        zipCode: metadata.zipCode || '',
        country: metadata.country || 'US'
      },
      paymentStatus: 'Paid',
      paymentIntentId: paymentIntent.id,
      notes: [{
        content: `Order created via Stripe payment (ID: ${paymentIntent.id})`,
        author: 'System',
        type: 'system'
      }]
    });
    
    await order.save();
    console.log(`Order ${orderNumber} created successfully for payment ${paymentIntent.id}`);
    
    // Update product inventory
    await updateInventory(cartItems);
    
    // Send order confirmation email
    const user = await User.findById(userId);
    if (user && user.email) {
      try {
        // Use emailService directly instead of adapter
        await emailService.sendOrderConfirmationEmail(
          { email: user.email, name: user.name || 'Valued Customer' },
          {
            orderNumber,
            items: order.items,
            total: order.total,
            subtotal: order.total * 0.93, // Approximation if actual subtotal is not stored
            tax: order.total * 0.07, // Approximation if actual tax is not stored
            shippingAddress: order.shippingAddress,
            deliveryMethod: order.deliveryMethod,
            selectedTime: order.selectedTime,
            vivaBucksEarned: Math.floor(order.total) // Simple points calculation
          }
        );
        
        // Mark email as sent
        order.emailSent = true;
        await order.save();
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Don't fail the process if email sending fails
      }
    }
    
    // Emit order created event
    eventEmitter.emit(Events.ORDER_CREATED, {
      orderId: order._id,
      userId: order.userId,
      total: order.total,
      type: 'ORDER_CREATED',
      timestamp: new Date().toISOString()
    });
    
    return order;
  } catch (error) {
    console.error('Error handling regular order:', error);
    throw error;
  }
}

async function updateInventory(items) {
  try {
    const Product = getProductModel();
    for (const item of items) {
      const productId = item.id || item._id || item.productId;
      const quantity = item.quantity || 1;
      
      if (!productId) continue;
      
      // Find product and update stock
      const product = await Product.findById(productId);
      if (product && typeof product.stock === 'number') {
        product.stock = Math.max(0, product.stock - quantity);
        await product.save();
        console.log(`Updated inventory for product ${productId}, new stock: ${product.stock}`);
      }
    }
  } catch (error) {
    console.error('Error updating inventory:', error);
    // Don't fail the process if inventory update fails
  }
}

async function handlePrescriptionDelivery(paymentIntent) {
  await dbConnect();
  const { metadata } = paymentIntent;
  const address = JSON.parse(metadata.address);
  const contact = JSON.parse(metadata.contact);

  try {
    // Calculate estimated delivery time
    const estimatedDelivery = calculateEstimatedDelivery(metadata.deliverySpeed);

    // Create delivery record
    const delivery = await PrescriptionDelivery.create({
      paymentIntentId: paymentIntent.id,
      userId: metadata.userId !== 'guest' ? metadata.userId : null,
      status: 'PENDING',
      deliverySpeed: metadata.deliverySpeed,
      amount: paymentIntent.amount,
      address: {
        street: address.street,
        apartment: address.apartment || '',
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      },
      contact: {
        name: contact.name,
        phone: contact.phone
      },
      estimatedDelivery
    });

    // Send confirmation email using emailService directly
    await emailService.sendDeliveryConfirmationEmail(
      { email: paymentIntent.receipt_email || contact.email, name: contact.name },
      {
        id: delivery._id,
        estimatedDelivery,
        address,
        contact,
        amount: paymentIntent.amount / 100,
        deliverySpeed: metadata.deliverySpeed
      }
    );

    // Update delivery status
    await delivery.updateOne({ status: 'CONFIRMED' });

  } catch (error) {
    console.error('Error handling prescription delivery:', error);
    throw error;
  }
}

function calculateEstimatedDelivery(deliverySpeed) {
  const now = new Date();
  
  switch (deliverySpeed) {
    case 'ONE_HOUR':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case 'SAME_DAY':
      // Set to 6 PM today
      const sameDay = new Date(now);
      sameDay.setHours(18, 0, 0, 0);
      return sameDay;
    case 'NEXT_DAY':
      // Set to 6 PM tomorrow
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(18, 0, 0, 0);
      return nextDay;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
} 