import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { calculateTierFromPoints } from "@/lib/loyalty/loyaltyService";

export async function POST(req) {
  try {
    const token = req.nextauth?.token;
    // Middleware ensures token exists and user is ADMIN or MANAGER.
    // This route specifically requires ADMIN.
    if (!token || token.role !== 'ADMIN') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { userId, adjustment } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.loyaltyProgram) {
      user.loyaltyProgram = {
        points: 0,
        tier: 'None',
        multiplier: 1,
        coupons: [],
        transactions: []
      };
    }

    user.loyaltyProgram.points += adjustment;
    if (user.loyaltyProgram.points < 0) {
      user.loyaltyProgram.points = 0;
    }

    user.loyaltyProgram.tier = calculateTierFromPoints(user.loyaltyProgram.points);

    user.loyaltyProgram.transactions.push({
      type: adjustment > 0 ? 'earn' : 'redeem',
      points: Math.abs(adjustment),
      description: `Points ${adjustment > 0 ? 'added' : 'deducted'} by admin`
    });

    await user.save();

    return Response.json({
      points: user.loyaltyProgram.points,
      tier: user.loyaltyProgram.tier
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 