import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { LoyaltyCheckoutService } from "@/lib/checkout/loyaltyCheckoutService";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    const { orderId, amount } = data;

    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const benefits = await LoyaltyCheckoutService.calculateLoyaltyBenefits(
      user,
      amount
    );

    // Update user points
    user.vivaBucks = (user.vivaBucks || 0) + benefits.totalPoints;
    user.cumulativePoints = (user.cumulativePoints || 0) + benefits.totalPoints;

    // Add to reward history
    user.rewardHistory.push({
      type: 'POINTS_EARNED',
      points: benefits.basePoints,
      adjustedPoints: benefits.totalPoints,
      multiplier: benefits.tierMultiplier,
      tier: user.currentTier || 'BRONZE',
      source: 'purchase',
      appliedEvents: benefits.appliedEvents,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();

    return Response.json({
      points: benefits.totalPoints,
      totalPoints: user.vivaBucks,
      lifetimePoints: user.cumulativePoints,
      tier: user.currentTier,
      multiplier: user.pointsMultiplier,
      benefits
    });
  } catch (error) {
    console.error('Error processing loyalty points:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 