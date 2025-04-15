import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { calculateBirthdayReward, isWithinDays } from "@/lib/loyalty/utils";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    
    if (!user || !user.birthday) {
      return Response.json({ error: "Birthday not set" }, { status: 400 });
    }

    const today = new Date();
    const birthday = new Date(user.birthday);
    birthday.setFullYear(today.getFullYear());

    // Check if birthday is within 7 days
    if (!isWithinDays(today, birthday, 7)) {
      return Response.json({ error: "Not birthday period" }, { status: 400 });
    }

    // Calculate reward based on tier
    const rewardPoints = calculateBirthdayReward(user.loyaltyProgram?.tier || 'None');

    // Add points to user's account
    user.loyaltyProgram.points += rewardPoints;
    user.loyaltyProgram.transactions.push({
      type: 'earn',
      points: rewardPoints,
      description: 'Birthday Reward'
    });

    await user.save();

    return Response.json({
      points: rewardPoints,
      totalPoints: user.loyaltyProgram.points
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 