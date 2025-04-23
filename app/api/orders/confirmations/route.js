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

    // Create order record
    const order = new Order({
      orderNumber: formattedData.orderNumber,
      userId: session?.user?.id,
      items: formattedData.items.map(item => ({
        productId: item.productId || item._id || 'unknown',
        name: item.name,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        image: item.image
      })),
      total: parseFloat(formattedData.total),
      status: 'Processing',
      paymentStatus: 'Paid',
      paymentIntentId: formattedData.orderNumber,
      deliveryMethod: formattedData.deliveryMethod,
      selectedTime: formattedData.selectedTime,
      shippingAddress: formattedData.shippingAddress,
      emailSent: false
    });

    await order.save();
    console.log('✅ Order record created:', order.orderNumber);

    // Generate and send email
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

    // Send SMS notification if phone number is available
    if (session?.user?.id) {
      const user = await User.findById(session.user.id);
      console.log('📱 Checking user for SMS:', {
        userId: session.user.id,
        hasPhoneNumber: !!user?.phoneNumber,
        phoneNumber: user?.phoneNumber,
        smsPreferences: user?.smsPreferences
      });

      if (user?.phoneNumber) {
        try {
          const message = `Your order #${formattedData.orderNumber} has been confirmed! Total: $${formattedData.total}. Thank you for shopping with Viva Pharmacy!`;
          console.log('📱 Attempting to send SMS:', {
            to: user.phoneNumber,
            messageLength: message.length
          });
          
          await twilioService.sendSMS(user.phoneNumber, message);
          console.log('✅ SMS notification sent successfully');
        } catch (smsError) {
          console.error('❌ Error sending SMS:', {
            error: smsError.message,
            code: smsError.code,
            status: smsError.status
          });
        }
      } else {
        console.log('⚠️ No phone number found for user:', session.user.id);
      }
    }

    // Calculate and apply loyalty benefits
    if (session?.user?.id) {
      try {
        const user = await User.findById(session.user.id);
        if (!user) throw new Error('User not found');

        // Use LoyaltyCheckoutService to calculate benefits without emitting events
        const amount = parseFloat(formattedData.total);
        const loyaltyBenefits = await LoyaltyCheckoutService.calculateLoyaltyBenefits(
          user,
          amount
        );

        // Initialize fields if they don't exist
        user.vivaBucks = user.vivaBucks || 0;
        user.cumulativePoints = user.cumulativePoints || 0;
        user.currentTier = user.currentTier || 'BRONZE';
        user.pointsMultiplier = user.pointsMultiplier || 1;
        user.rewardHistory = user.rewardHistory || [];

        // Update points
        const oldPoints = user.vivaBucks;
        const oldLifetimePoints = user.cumulativePoints;
        
        user.vivaBucks += loyaltyBenefits.totalPoints;
        user.cumulativePoints += loyaltyBenefits.totalPoints;

        // Add points earned entry
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

        // Check for tier upgrade
        const newTier = calculateTierFromPoints(user.cumulativePoints);
        if (newTier !== user.currentTier) {
          const oldTier = user.currentTier;
          user.currentTier = newTier;
          user.pointsMultiplier = TIER_CONFIG[newTier]?.multiplier || 1;

          // Add tier change entry
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

        // Wait for a short delay to ensure any pending transactions are complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Use a single consolidated loyalty update event with delay
        setTimeout(async () => {
          try {
            // Use loyaltyEventsService for all loyalty-related events
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

            // Payment event emitted separately after a delay
            setTimeout(() => {
              eventEmitter.emit(Events.PAYMENT_COMPLETED, {
                userId: user._id,
                paymentIntentId: formattedData.orderNumber,
                amount: amount,
                status: 'completed'
              });
            }, 200);
          } catch (emitError) {
            console.error('Error emitting loyalty events:', emitError);
          }
        }, 100);
      } catch (error) {
        console.error('Error processing loyalty benefits:', error);
      }
    }

    // Add this to ensure the loyalty redemption is cleared on order completion
    if (data.loyaltyRedemption && session?.user?.id) {
      console.log('✅ Loyalty redemption confirmed:', data.loyaltyRedemption);
    }

    return NextResponse.json({
      success: true,
      data: {
        subtotal: parseFloat(formattedData.subtotal),
        tax: parseFloat(formattedData.tax),
        total: parseFloat(formattedData.total),
        loyaltyRedemption: data.loyaltyRedemption
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
