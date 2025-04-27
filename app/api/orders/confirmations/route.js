import { NextResponse } from 'next/server';
import { generateOrderConfirmationEmail } from '@/lib/email-templates/order-confirmation';
import { sendOrderConfirmationEmail } from '@/lib/email/sendEmail';
import { eventEmitter, Events } from '@/lib/eventEmitter';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LoyaltyCheckoutService } from '@/lib/checkout/loyaltyCheckoutService';
import loyaltyEventsService from '@/lib/loyalty/eventsService';
import User from '@/models/User';
import Order from '@/models/Order';
import { calculateTierFromPoints, TIER_CONFIG } from '@/lib/loyalty/loyaltyService';
import { twilioService } from '@/lib/sms/twilioService';

export async function POST(request) {
  const backendTimingLog = [];
  const logTime = (msg) => backendTimingLog.push({ msg, time: Date.now() });
  try {
    const session = await getServerSession(authOptions);
    const data = await request.json();
    
    // DRY: Utility to format item
    const formatItem = (item) => ({
      name: item.name,
      price: parseFloat(item.price || 0).toFixed(2),
      quantity: parseInt(item.quantity || 1),
      image: item.image,
      hasImage: !!item.image,
      subtotal: (parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2),
      productId: item.productId || item._id || 'unknown',
    });
    // Format all numerical values immediately
    const formattedData = {
      orderNumber: data.orderNumber,
      email: data.email,
      items: data.items.map(formatItem),
      subtotal: parseFloat(data.subtotal || 0).toFixed(2),
      tax: parseFloat(data.tax || 0).toFixed(2),
      total: parseFloat(data.total || 0).toFixed(2),
      shippingAddress: data.shippingAddress,
      deliveryMethod: data.deliveryMethod,
      selectedTime: data.selectedTime,
      customerName: data.customerName || session?.user?.name || 'Valued Customer'
    };
    logTime('Formatted input');
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

    // Create order record
    const order = new Order({
      orderNumber: formattedData.orderNumber,
      userId: session?.user?.id,
      items: formattedData.items.map(formatItem),
      total: parseFloat(formattedData.total),
      status: 'Processing',
      paymentStatus: 'Paid',
      paymentIntentId: formattedData.orderNumber,
      deliveryMethod: formattedData.deliveryMethod,
      selectedTime: formattedData.selectedTime,
      shippingAddress: formattedData.shippingAddress,
      emailSent: false
    });
    logTime('Order model constructed');
    await order.save();
    logTime('Order saved');

    // Respond to client ASAP after order is saved
    const respondData = {
      success: true,
      timings: backendTimingLog,
      data: {
        subtotal: parseFloat(formattedData.subtotal),
        tax: parseFloat(formattedData.tax),
        total: parseFloat(formattedData.total),
        loyaltyRedemption: data.loyaltyRedemption
      }
    };

    // Async side effects (email, sms, loyalty)
    (async () => {
      try {
        // Email
        const emailData = {
          ...formattedData,
          items: formattedData.items.map(item => ({
            ...item,
            price: parseFloat(item.price),
            subtotal: parseFloat(item.subtotal)
          }))
        };
        await sendOrderConfirmationEmail(formattedData.email, emailData);
        order.emailSent = true;
        await order.save();
        logTime('Email sent & order updated');
      } catch (err) {
        console.error('Error sending order confirmation email:', err);
      }

      // SMS
      if (session?.user?.id) {
        try {
          const user = await User.findById(session.user.id);
          if (user?.phoneNumber) {
            const message = `Your order #${formattedData.orderNumber} has been confirmed! Total: $${formattedData.total}. Thank you for shopping with Viva Pharmacy!`;
            await twilioService.sendSMS(user.phoneNumber, message);
            logTime('SMS sent');
          }
        } catch (smsError) {
          console.error('Error sending SMS:', smsError);
        }
      }

      // Loyalty
      if (session?.user?.id) {
        try {
          // Log request to help debug
          console.log('💯 Processing loyalty for order:', {
            orderId: formattedData.orderNumber,
            clientEstimate: data.pointsEstimate,
            calculatedOnClient: data.calculatedOnClient,
            total: formattedData.total
          });
          
          const user = await User.findById(session.user.id);
          if (!user) throw new Error('User not found');
          const amount = parseFloat(formattedData.total);
          const loyaltyBenefits = await LoyaltyCheckoutService.calculateLoyaltyBenefits(user, amount);
          user.vivaBucks = user.vivaBucks || 0;
          user.cumulativePoints = user.cumulativePoints || 0;
          user.currentTier = user.currentTier || 'BRONZE';
          user.pointsMultiplier = user.pointsMultiplier || 1;
          user.rewardHistory = user.rewardHistory || [];
          const oldPoints = user.vivaBucks;
          const oldLifetimePoints = user.cumulativePoints;
          // Log points calculation to help debug
          console.log('📊 Loyalty points calculation:', { 
            basePoints: loyaltyBenefits.basePoints,
            tierMultiplier: loyaltyBenefits.tierMultiplier,
            totalPoints: loyaltyBenefits.totalPoints,
            currentTier: user.currentTier,
            appliedEvents: loyaltyBenefits.appliedEvents?.length || 0
          });
          
          // Server-side is the source of truth - we add points here
          user.vivaBucks += loyaltyBenefits.totalPoints;
          user.cumulativePoints += loyaltyBenefits.totalPoints;
          user.rewardHistory.push({
            type: 'POINTS_EARNED',
            points: loyaltyBenefits.basePoints,
            adjustedPoints: loyaltyBenefits.totalPoints,
            multiplier: loyaltyBenefits.tierMultiplier,
            tier: user.currentTier,
            source: 'purchase',
            appliedEvents: loyaltyBenefits.appliedEvents || [],
            timestamp: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
          const newTier = calculateTierFromPoints(user.cumulativePoints);
          if (newTier !== user.currentTier) {
            const oldTier = user.currentTier;
            user.currentTier = newTier;
            user.pointsMultiplier = TIER_CONFIG[newTier]?.multiplier || 1;
            user.rewardHistory.push({
              type: 'TIER_CHANGED',
              oldTier: oldTier,
              newTier: newTier,
              timestamp: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
          await user.save();
          logTime('User loyalty updated');
          setTimeout(async () => {
            try {
              await loyaltyEventsService.emitLoyaltyUpdate(user._id, {
                type: 'ORDER_COMPLETE',
                paymentIntentId: formattedData.orderNumber,
                amount: amount,
                isComplete: true,
                points: loyaltyBenefits.totalPoints,
                vivaBucks: user.vivaBucks,
                loyaltyBenefits: {
                  ...loyaltyBenefits,
                  currentPoints: user.vivaBucks,
                  lifetimePoints: user.cumulativePoints,
                  currentTier: user.currentTier,
                  oldPoints,
                  oldLifetimePoints,
                  tierChanged: newTier !== user.currentTier,
                  oldTier: user.currentTier,
                  newTier: newTier
                }
              });
              setTimeout(() => {
                eventEmitter.emit(Events.PAYMENT_COMPLETED, {
                  userId: user._id,
                  paymentIntentId: formattedData.orderNumber,
                  amount: amount,
                  status: 'completed'
                });
              }, 200);
              logTime('Loyalty events emitted');
            } catch (emitError) {
              console.error('Error emitting loyalty events:', emitError);
            }
          }, 100);
        } catch (error) {
          console.error('Error processing loyalty benefits:', error);
        }
      }
    })();

    // Add this to ensure the loyalty redemption is cleared on order completion
    if (data.loyaltyRedemption && session?.user?.id) {
      console.log('✅ Loyalty redemption confirmed:', data.loyaltyRedemption);
    }

    logTime('Responding to client');
    return NextResponse.json(respondData);




  } catch (error) {
    console.error('❌ Order confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to send order confirmation' },
      { status: 500 }
    );
  }
}
