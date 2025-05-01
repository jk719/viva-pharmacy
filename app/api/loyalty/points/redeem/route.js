import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(request) {
  const token = request.nextauth?.token;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const data = await request.json();
    const { amount = 100 } = data; // Default to 100 points ($10)
    
    const user = await User.findById(token.sub);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough points
    if (user.loyalty.vivaBucks < amount) {
      return NextResponse.json({ 
        error: "Not enough VivaBucks available",
        available: user.loyalty.vivaBucks
      }, { status: 400 });
    }

    // Subtract points
    user.loyalty.vivaBucks -= amount;

    // Add to reward history
    user.loyalty.rewardHistory.push({
      type: 'POINTS_REDEEMED',
      points: amount,
      pointsUsed: amount,
      tier: user.loyalty.tier || 'BRONZE',
      source: 'checkout',
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();

    return NextResponse.json({
      success: true,
      redeemed: amount,
      discount: (amount / 10).toFixed(2), // $10 per 100 points
      remainingPoints: user.loyalty.vivaBucks
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 