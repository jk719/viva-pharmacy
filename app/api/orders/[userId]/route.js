import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        const pathname = new URL(request.url).pathname;
        const userId = pathname.split('/').filter(Boolean).pop();
        
        console.log('Attempting to fetch orders with userId:', userId);

        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response(
                JSON.stringify({ error: "Not authenticated" }), 
                { status: 401 }
            );
        }

        // Convert string userId to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        console.log('Converted to ObjectId:', userObjectId);

        const query = { userId: userObjectId };
        console.log('Query:', query);
        
        const orders = await Order.find(query).sort({ createdAt: -1 });
        console.log('Orders found:', orders.length);

        // If no orders, let's see what orders exist
        if (orders.length === 0) {
            const sampleOrders = await Order.find().limit(5);
            console.log('Sample orders in DB:', sampleOrders);
        }

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
        console.error('Error in orders API:', error);
        return new Response(
            JSON.stringify({ 
                error: "Failed to fetch orders",
                details: error.message 
            }), 
            { status: 500 }
        );
    }
} 