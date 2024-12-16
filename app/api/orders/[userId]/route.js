import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        // 1. Get and validate userId
        const pathname = new URL(request.url).pathname;
        const userId = pathname.split('/').filter(Boolean).pop();
        
        console.log('API: Received request for userId:', userId);

        if (!userId || userId === 'undefined') {
            console.error('API: Invalid userId received');
            return new Response(
                JSON.stringify({ error: "Invalid user ID" }), 
                { status: 400 }
            );
        }

        // 2. Connect to DB
        await dbConnect();
        console.log('API: Connected to database');

        // 3. Validate session
        const session = await getServerSession(authOptions);
        console.log('API: Session check:', !!session);

        if (!session) {
            console.error('API: No valid session found');
            return new Response(
                JSON.stringify({ error: "Not authenticated" }), 
                { status: 401 }
            );
        }

        // 4. Validate that the requesting user matches the userId
        if (session.user.id !== userId) {
            console.error('API: User ID mismatch', {
                sessionUserId: session.user.id,
                requestedUserId: userId
            });
            return new Response(
                JSON.stringify({ error: "Unauthorized access" }), 
                { status: 403 }
            );
        }

        // 5. Convert string userId to ObjectId
        let userObjectId;
        try {
            userObjectId = new mongoose.Types.ObjectId(userId);
        } catch (error) {
            console.error('API: Invalid ObjectId format:', error);
            return new Response(
                JSON.stringify({ error: "Invalid user ID format" }), 
                { status: 400 }
            );
        }

        // 6. Query orders
        const query = { userId: userObjectId };
        console.log('API: Executing query:', JSON.stringify(query));
        
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .lean(); // Convert to plain JavaScript objects

        console.log('API: Found orders count:', orders.length);

        // 7. Debug: If no orders found, check for any orders in the system
        if (orders.length === 0) {
            const totalOrders = await Order.countDocuments();
            const sampleOrder = await Order.findOne();
            console.log('API: Debug - Total orders in system:', totalOrders);
            console.log('API: Debug - Sample order structure:', 
                sampleOrder ? {
                    id: sampleOrder._id,
                    userId: sampleOrder.userId,
                    // exclude sensitive data
                    hasItems: !!sampleOrder.items?.length
                } : 'No orders found'
            );
        }

        // 8. Return response
        return new Response(
            JSON.stringify(orders), 
            { 
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

    } catch (error) {
        console.error('API: Error in orders endpoint:', error);
        return new Response(
            JSON.stringify({ 
                error: "Failed to fetch orders",
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }), 
            { status: 500 }
        );
    }
} 