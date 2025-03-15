import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return new Response('Unauthorized', { status: 401 });
        }

        await dbConnect();
        const { id } = params;
        const body = await request.json();
        
        const order = await Order.findById(id);
        if (!order) {
            return new Response('Order not found', { status: 404 });
        }

        // Validate refund request
        if (!body.items || !body.reason) {
            return new Response('Invalid refund request', { status: 400 });
        }

        // Calculate refund amount
        const refundAmount = body.items.reduce((total, item) => {
            const orderItem = order.items.find(i => i._id.toString() === item.itemId);
            return total + (orderItem.price * item.quantity);
        }, 0);

        // Process refund through Stripe
        const refund = await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
            amount: Math.round(refundAmount * 100), // Convert to cents
            reason: 'requested_by_customer'
        });

        // Update order with refund details
        order.refundStatus = 'Processed';
        order.status = 'Refunded';
        order.refundDetails = {
            requestDate: new Date(),
            processedDate: new Date(),
            amount: refundAmount,
            reason: body.reason,
            items: body.items,
            refundId: refund.id,
            processedBy: session.user.id
        };

        // Add note about refund
        order.notes.push({
            content: `Refund processed: $${refundAmount.toFixed(2)} - ${body.reason}`,
            author: session.user.email,
            type: 'system'
        });

        await order.save();

        return NextResponse.json({
            message: 'Refund processed successfully',
            order
        });
    } catch (error) {
        console.error('Refund processing error:', error);
        return new Response(error.message, { status: 500 });
    }
} 