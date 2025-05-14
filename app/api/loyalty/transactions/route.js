import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { LoyaltyTransaction } from "@/models/LoyaltyTransaction";
import { NextResponse } from "next/server";

/**
 * Fetch transaction history for a user
 * 
 * @param {Object} request - The request object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  // Verify authentication
  if (!session || !session.user) {
    console.error("Unauthorized attempt to view transactions");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Only admins can view other users' transactions
  const isAdmin = session.user.role === "ADMIN";
  
  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || session.user.id;
  const limit = parseInt(searchParams.get("limit") || 50);
  const page = parseInt(searchParams.get("page") || 1);
  const skip = (page - 1) * limit;
  
  // Ensure the user can only access their own data unless they're an admin
  if (userId !== session.user.id && !isAdmin) {
    console.error(`User ${session.user.id} attempted to view transactions for ${userId}`);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  try {
    await connectDB();
    
    // Get transaction count
    const totalCount = await LoyaltyTransaction.countDocuments({ userId });
    
    // Get transactions
    const transactions = await LoyaltyTransaction
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      transactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions", details: error.message },
      { status: 500 }
    );
  }
} 