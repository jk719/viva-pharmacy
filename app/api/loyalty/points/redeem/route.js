import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    const { amount = 100 } = data; // Default to 100 points ($10)
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough points
    if (user.vivaBucks < amount) {
      return Response.json({ 
        error: "Not enough VivaBucks available",
        available: user.vivaBucks
      }, { status: 400 });
    }

    // Subtract points
    user.vivaBucks -= amount;

    // Add to reward history
    user.rewardHistory.push({
      type: 'POINTS_REDEEMED',
      points: amount,
      pointsUsed: amount,
      tier: user.currentTier || 'BRONZE',
      source: 'checkout',
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();

    return Response.json({
      success: true,
      redeemed: amount,
      discount: (amount / 10).toFixed(2), // $10 per 100 points
      remainingPoints: user.vivaBucks
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 