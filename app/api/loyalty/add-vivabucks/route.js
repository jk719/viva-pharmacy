import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import LoyaltyTransaction from "../../../../models/LoyaltyTransaction";
import { NextResponse } from "next/server";

/**
 * Add VivaBucks to a user's account and record the transaction
 * 
 * @param {Object} request - The request object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  // Verify authentication
  if (!session || !session.user) {
    console.error("Unauthorized attempt to add VivaBucks");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Only admins can add VivaBucks to other users
  const isAdmin = session.user.role === "ADMIN";
  
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, vivaBucks, source, sourceId, metadata = {} } = body;
    
    // Validate required fields
    if (!userId || typeof vivaBucks !== 'number' || !source) {
      return NextResponse.json(
        { error: "Missing required fields. userId, vivaBucks, and source are required." },
        { status: 400 }
      );
    }
    
    // Ensure the user can only modify their own data unless they're an admin
    if (userId !== session.user.id && !isAdmin) {
      console.error(`User ${session.user.id} attempted to add VivaBucks to ${userId}`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Connect to database
    await dbConnect();
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Current VivaBucks value (default to 0 if not set)
    const currentVivaBucks = user.vivaBucks || 0;
    const currentCumulativeVivaBucks = user.cumulativeVivaBucks || 0;
    
    // Calculate new values
    const newVivaBucks = currentVivaBucks + vivaBucks;
    const newCumulativeVivaBucks = currentCumulativeVivaBucks + (vivaBucks > 0 ? vivaBucks : 0);
    
    // Update user in database
    user.vivaBucks = newVivaBucks;
    user.cumulativeVivaBucks = newCumulativeVivaBucks;
    
    // Add timestamp for tracking
    user.lastLoyaltyUpdate = new Date();
    
    // Save the updated user
    await user.save();
    console.log(`Updated user ${userId} VivaBucks: ${currentVivaBucks} -> ${newVivaBucks}`);
    
    // Record the transaction
    const transaction = new LoyaltyTransaction({
      userId,
      amount: vivaBucks,
      type: vivaBucks > 0 ? 'EARN' : 'SPEND',
      source,
      sourceId,
      metadata,
      createdBy: session.user.id,
      createdAt: new Date()
    });
    
    await transaction.save();
    console.log(`Recorded loyalty transaction ${transaction._id} for user ${userId}`);
    
    // Return success response
    return NextResponse.json({
      success: true,
      userId,
      previousVivaBucks: currentVivaBucks,
      currentVivaBucks: newVivaBucks,
      change: vivaBucks,
      cumulativeVivaBucks: newCumulativeVivaBucks,
      transactionId: transaction._id
    });
  } catch (error) {
    console.error("Error adding VivaBucks:", error);
    return NextResponse.json(
      { error: "Failed to add VivaBucks", details: error.message },
      { status: 500 }
    );
  }
} 