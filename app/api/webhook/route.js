import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { generateOrderConfirmationEmail } from '@/lib/email-templates/order-confirmation';
import { sendOrderConfirmationEmail } from '@/lib/email/sendEmail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_SIGNING_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export async function POST(request) {
    try {
        console.log('\n🔄 Webhook request received in:', IS_PRODUCTION ? 'production' : 'development');
        
        const rawBody = await request.text();
        const headersList = await headers();
        const sig = headersList.get('stripe-signature');
        
        if (!WEBHOOK_SECRET) {
            console.error('❌ Webhook secret is missing');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
            console.log('✅ Event constructed successfully:', event.type);
        } catch (err) {
            console.error('❌ Webhook verification failed:', {
                error: err.message,
                sigHeader: sig?.substring(0, 20) + '...',
                bodyLength: rawBody.length
            });
            return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
        }

        // Handle payment_intent.succeeded
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            
            console.log('💰 Payment Intent Succeeded:', {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                status: paymentIntent.status
            });

            try {
                await dbConnect();

                // Check if order exists
                const existingOrder = await Order.findOne({ 
                    paymentIntentId: paymentIntent.id 
                });

                if (existingOrder) {
                    // Even if order exists, try to send email if it hasn't been sent
                    const user = await User.findById(existingOrder.userId);
                    if (user && !existingOrder.emailSent) {
                        console.log('📧 Attempting to send email for existing order:', existingOrder._id);
                        
                        try {
                            const emailHtml = generateOrderConfirmationEmail({
                                orderNumber: existingOrder._id,
                                customerName: user.name || user.email.split('@')[0],
                                items: existingOrder.items,
                                subtotal: existingOrder.total,
                                tax: existingOrder.total * 0.08875,
                                total: existingOrder.total,
                                shippingAddress: existingOrder.shippingAddress,
                                deliveryMethod: existingOrder.deliveryMethod,
                                selectedTime: existingOrder.selectedTime,
                                vivaBucksEarned: 0, // Already handled in first attempt
                                rewardPointsEarned: 0,
                                baseUrl: IS_PRODUCTION ? 
                                    'https://your-production-url.vercel.app' : 
                                    'http://localhost:3000'
                            });

                            await sendOrderConfirmationEmail(
                                user.email,
                                'Your Viva Pharmacy Order Confirmation',
                                emailHtml
                            );

                            // Mark email as sent
                            existingOrder.emailSent = true;
                            await existingOrder.save();

                            console.log('✅ Email sent for existing order:', existingOrder._id);
                        } catch (emailError) {
                            console.error('❌ Failed to send email for existing order:', emailError);
                        }
                    }

                    return NextResponse.json({ 
                        received: true,
                        message: 'Order processed and email attempted'
                    });
                }

                const fullPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
                
                console.log('💳 Full Payment Intent:', {
                    id: fullPaymentIntent.id,
                    amount: fullPaymentIntent.amount,
                    metadata: fullPaymentIntent.metadata
                });

                // Check if we need to process this payment
                if (!fullPaymentIntent.metadata?.cartItemIds) {
                    console.log('⏭️ Skipping payment without cart items');
                    return NextResponse.json({ received: true });
                }

                // Parse cart items and add product images
                const cartItems = JSON.parse(fullPaymentIntent.metadata.cartItemIds);
                
                // Fetch all products at once
                const productIds = cartItems.map(item => item.id);
                const products = await Product.find({ _id: { $in: productIds } });
                
                // After fetching products
                console.log('🖼️ Products from database:', products.map(p => ({
                    name: p.name,
                    image: p.image,
                    _id: p._id.toString()
                })));

                const itemsWithImages = cartItems.map(item => {
                    const product = products.find(p => p._id.toString() === item.id.toString());
                    let imageUrl = product?.image || null;
                    
                    console.log('🔍 Processing image for:', {
                        productName: item.name,
                        originalImage: imageUrl
                    });
                    
                    // Handle different image URL formats
                    if (imageUrl) {
                        if (imageUrl.startsWith('http')) {
                            console.log('✅ Already absolute URL:', imageUrl);
                        } else if (imageUrl.startsWith('/')) {
                            imageUrl = `${BASE_URL}${imageUrl}`;
                            console.log('🔄 Converting to absolute URL:', imageUrl);
                        } else {
                            imageUrl = `${BASE_URL}/${imageUrl}`;
                            console.log('➕ Adding base URL:', imageUrl);
                        }
                    }

                    return {
                        productId: item.id.toString(),
                        name: item.name,
                        quantity: item.qty,
                        price: parseFloat(item.price),
                        image: imageUrl
                    };
                });

                // Log final items before email generation
                console.log('📧 Final items for email:', itemsWithImages.map(item => ({
                    name: item.name,
                    finalImage: item.image
                })));

                // Base order data with enhanced items
                const orderData = {
                    userId: fullPaymentIntent.metadata.userId,
                    items: itemsWithImages, // Use enhanced items with images
                    total: fullPaymentIntent.amount / 100,
                    status: 'Pending',
                    paymentStatus: 'Paid',
                    paymentIntentId: fullPaymentIntent.id,
                    deliveryMethod: fullPaymentIntent.metadata.deliveryMethod || 'delivery',
                    selectedTime: fullPaymentIntent.metadata.selectedTime || '9:00 AM'
                };

                // Only add shipping address if delivery method is 'delivery'
                if (fullPaymentIntent.metadata.deliveryMethod === 'delivery') {
                    if (!fullPaymentIntent.metadata.street || 
                        !fullPaymentIntent.metadata.city || 
                        !fullPaymentIntent.metadata.state || 
                        !fullPaymentIntent.metadata.zipCode) {
                        throw new Error('Shipping address is required for delivery orders');
                    }
                    
                    orderData.shippingAddress = {
                        street: fullPaymentIntent.metadata.street,
                        city: fullPaymentIntent.metadata.city,
                        state: fullPaymentIntent.metadata.state,
                        zipCode: fullPaymentIntent.metadata.zipCode,
                        country: fullPaymentIntent.metadata.country || 'US'
                    };
                }

                console.log('📝 Creating order with data:', JSON.stringify(orderData, null, 2));
                
                // Create order with additional check
                const order = await Order.create({
                    ...orderData,
                    createdAt: new Date(), // Ensure consistent timestamp
                    paymentIntentId: fullPaymentIntent.id // Ensure this is always set
                });

                console.log('✅ New order created:', order._id);

                // Handle points
                const user = await User.findById(fullPaymentIntent.metadata.userId);
                if (user) {
                    const pointsToAdd = Math.floor(fullPaymentIntent.amount / 100);
                    const pointsResult = await user.addPoints(pointsToAdd);
                    console.log('✨ Points updated:', pointsResult);

                    // Calculate VivaBucks and rewards earned
                    const vivaBucksEarned = pointsResult.vivaBucksAdded || 0;
                    const rewardPointsEarned = pointsResult.pointsAdded || pointsToAdd;

                    console.log('📧 Preparing to send order confirmation email:', {
                        userEmail: user.email,
                        orderNumber: order._id,
                        itemCount: itemsWithImages.length,
                        vivaBucksEarned,
                        rewardPointsEarned
                    });

                    // Add this debug logging before email generation
                    console.log('Debug: Original items with images:', itemsWithImages.map(item => ({
                        name: item.name,
                        originalImage: item.image
                    })));

                    const processedItems = itemsWithImages.map(item => ({
                        ...item,
                        image: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : null
                    }));

                    console.log('Debug: Processed items with images:', processedItems.map(item => ({
                        name: item.name,
                        processedImage: item.image
                    })));

                    // Enhanced email sending with retry logic
                    const sendEmailWithRetry = async (retries = 3) => {
                        for (let i = 0; i < retries; i++) {
                            try {
                                // Log full email configuration (except password)
                                console.log('📧 Email Configuration:', {
                                    environment: process.env.NODE_ENV,
                                    user: process.env.GMAIL_USER,
                                    host: process.env.EMAIL_SERVER_HOST,
                                    port: process.env.EMAIL_SERVER_PORT,
                                    isProduction: IS_PRODUCTION
                                });

                                if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
                                    throw new Error('Missing email configuration');
                                }

                                console.log(`📧 Attempt ${i + 1} to send email to:`, user.email);

                                const emailHtml = generateOrderConfirmationEmail({
                                    orderNumber: order._id,
                                    customerName: user.name || user.email.split('@')[0],
                                    items: processedItems,
                                    subtotal: orderData.total,
                                    tax: orderData.total * 0.08875,
                                    total: orderData.total,
                                    shippingAddress: orderData.shippingAddress,
                                    deliveryMethod: orderData.deliveryMethod,
                                    selectedTime: orderData.selectedTime,
                                    vivaBucksEarned,
                                    rewardPointsEarned,
                                    baseUrl: IS_PRODUCTION ? 
                                        'https://your-production-url.vercel.app' : 
                                        'http://localhost:3000'
                                });

                                // Log email content for debugging
                                console.log('📧 Email Content:', {
                                    to: user.email,
                                    subject: 'Your Viva Pharmacy Order Confirmation',
                                    htmlLength: emailHtml.length,
                                    configuration: {
                                        host: process.env.EMAIL_SERVER_HOST,
                                        port: process.env.EMAIL_SERVER_PORT,
                                        secure: false,
                                        auth: {
                                            user: process.env.GMAIL_USER,
                                            hasPassword: !!process.env.GMAIL_APP_PASSWORD
                                        }
                                    }
                                });

                                const emailResult = await sendOrderConfirmationEmail(
                                    user.email,
                                    'Your Viva Pharmacy Order Confirmation',
                                    emailHtml
                                );

                                console.log('✅ Email sent successfully:', {
                                    to: user.email,
                                    messageId: emailResult.messageId,
                                    attempt: i + 1
                                });
                                
                                return true;
                            } catch (error) {
                                console.error(`❌ Email attempt ${i + 1} failed:`, {
                                    error: error.message,
                                    stack: error.stack,
                                    config: {
                                        host: process.env.EMAIL_SERVER_HOST,
                                        port: process.env.EMAIL_SERVER_PORT,
                                        user: process.env.GMAIL_USER?.substring(0, 3) + '...'
                                    }
                                });
                                
                                if (i === retries - 1) throw error;
                                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                            }
                        }
                    };

                    try {
                        await sendEmailWithRetry();
                    } catch (emailError) {
                        console.error('❌ All email attempts failed:', emailError);
                        // Continue processing even if email fails
                    }
                }

                return NextResponse.json({ 
                    success: true,
                    orderId: order._id,
                    isNew: true,
                    emailSent: true
                });

            } catch (err) {
                console.error('❌ Error processing order:', {
                    error: err.message,
                    stack: err.stack,
                    environment: process.env.NODE_ENV
                });
                return NextResponse.json({ error: err.message }, { status: 500 });
            }
        }

        // Acknowledge other events
        return NextResponse.json({ received: true });

    } catch (err) {
        console.error('❌ General webhook error:', {
            error: err.message,
            stack: err.stack,
            environment: process.env.NODE_ENV
        });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
