import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';
import { emailService } from '@/lib/email/emailService';
import { LoyaltyCheckoutService } from '@/lib/checkout/loyaltyCheckoutService';
import loyaltyEventsService from '@/lib/loyalty/eventsService';
import { calculateTierFromPoints, TIER_CONFIG } from '@/lib/loyalty/loyaltyService';
import { twilioService } from '@/lib/sms/twilioService';

export async function executePostOrderTasks(order) {
    // Ensure database is connected
    await dbConnect();

    // Send Order Confirmation Email
    if (!order.emailSent) {
        try {
            const user = await User.findById(order.userId).select('email name');
            if (user && user.email) {
                const freshOrder = await Order.findById(order._id); // Re-fetch to ensure latest data for email
                if (freshOrder) {
                   await emailService.sendOrderConfirmationEmail(
                       { email: user.email, name: user.name || 'Valued Customer' },
                       {
                           orderNumber: freshOrder.orderNumber,
                           items: freshOrder.items,
                           total: freshOrder.total,
                           subtotal: freshOrder.subtotal || (freshOrder.total * 0.93), // Approximation if not present
                           tax: freshOrder.tax || (freshOrder.total * 0.07), // Approximation if not present
                           shippingAddress: freshOrder.shippingAddress,
                           deliveryMethod: freshOrder.deliveryMethod,
                           selectedTime: freshOrder.selectedTime,
                           vivaBucksEarned: Math.floor(freshOrder.total) // Simple approximation
                       }
                   );
                   await Order.updateOne({ _id: order._id }, { $set: { emailSent: true } });
                   console.log('✉️ Order confirmation email sent to:', user.email);
                } else {
                   console.error('❌ Order not found for sending email after creation:', order._id);
                }
            } else {
                console.warn('⚠️ User email not found for order confirmation:', order.userId);
            }
        } catch (emailErr) {
            console.error('❌ Error sending order confirmation email:', emailErr);
        }
    } else {
         console.log('ℹ️ Email already marked as sent for order:', order._id);
    }

    // Send SMS Notification
    try {
        const user = await User.findById(order.userId).select('phoneNumber smsPreferences');
        if (user?.phoneNumber && user?.smsPreferences?.orderConfirmations) {
            const message = `Your Viva Pharmacy order #${order.orderNumber} (Total: $${order.total.toFixed(2)}) has been confirmed!`;
            await twilioService.sendSMS(user.phoneNumber, message);
            console.log('📱 SMS notification sent for order:', order.orderNumber);
        }
    } catch (smsError) {
        console.error('❌ Error sending SMS notification:', smsError);
    }

    // Process Loyalty Points - Always process if not explicitly marked as processed
    if (order.loyaltyPointsProcessed !== true && order.userId) {
        try {
            const user = await User.findById(order.userId);
            if (!user) throw new Error(`User not found for loyalty processing: ${order.userId}`);

            const amount = order.total;
            const loyaltyBenefits = await LoyaltyCheckoutService.calculateLoyaltyBenefits(user, amount);

            // Initialize fields if they don't exist
            user.vivaBucks = user.vivaBucks || 0;
            user.cumulativePoints = user.cumulativePoints || 0;
            user.currentTier = user.currentTier || 'EXPLORER';
            user.pointsMultiplier = user.pointsMultiplier || TIER_CONFIG[user.currentTier]?.multiplier || 1;
            user.rewardHistory = user.rewardHistory || [];

            user.vivaBucks += loyaltyBenefits.totalPoints;
            user.cumulativePoints += loyaltyBenefits.totalPoints;
            user.rewardHistory.push({
                type: 'POINTS_EARNED',
                points: loyaltyBenefits.basePoints,
                adjustedPoints: loyaltyBenefits.totalPoints,
                multiplier: loyaltyBenefits.tierMultiplier,
                tier: user.currentTier,
                source: 'purchase',
                orderId: order._id,
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
                    orderId: order._id,
                    timestamp: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`✨ Tier Change: ${oldTier} -> ${newTier} for user ${user._id}`);
            }

            await user.save();

            await Order.updateOne({ _id: order._id }, { $set: { loyaltyPointsProcessed: true } });
            console.log('💯 Loyalty points processed successfully for order:', order._id);

            // Create loyalty transaction record directly
            try {
                const { LoyaltyTransaction } = await import('../../models/LoyaltyTransaction');
                
                const transaction = new LoyaltyTransaction({
                    userId: user._id,
                    amount: loyaltyBenefits.totalPoints,
                    type: 'EARN',
                    source: 'purchase',
                    sourceId: order.paymentIntentId || order._id.toString(),
                    metadata: {
                        orderId: order._id.toString(),
                        orderNumber: order.orderNumber,
                        amount: amount,
                        tier: newTier
                    },
                    createdBy: user._id,
                    createdAt: new Date()
                });
                
                await transaction.save();
                console.log('✅ Loyalty transaction recorded:', transaction._id);
            } catch (txError) {
                console.error('❌ Error creating loyalty transaction:', txError);
            }

            await loyaltyEventsService.emitLoyaltyUpdate(user._id, {
                type: 'ORDER_COMPLETE',
                orderId: order._id,
                paymentIntentId: order.paymentIntentId, // Ensure order object has paymentIntentId if needed by consumers
                amount: amount,
                points: loyaltyBenefits.totalPoints,
                vivaBucks: user.vivaBucks,
                loyaltyBenefits: {
                    ...loyaltyBenefits,
                    tier: newTier // Using the potentially updated tier
                }
            });

        } catch (loyaltyErr) {
            console.error('❌ Error processing loyalty points:', loyaltyErr);
        }
    } else if (order.loyaltyPointsProcessed) {
        console.log('ℹ️ Loyalty points already marked as processed for order:', order._id);
    }
}
