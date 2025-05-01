import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { calculateBirthdayReward, isWithinDays } from "@/lib/loyalty/utils";

export async function POST(request) {
  const token = request.nextauth?.token;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(token.sub);
    
    if (!user || !user.birthday) {
      return NextResponse.json({ error: "Birthday not set" }, { status: 400 });
    }

    const today = new Date();
    const birthday = new Date(user.birthday);
    birthday.setFullYear(today.getFullYear());

    if (!isWithinDays(today, birthday, 7)) {
      return NextResponse.json({ error: "Not birthday period" }, { status: 400 });
    }

    const rewardPoints = calculateBirthdayReward(user.loyalty?.tier || 'BRONZE');

    if (!user.loyalty) {
      user.loyalty = { vivaBucks: 0, cumulativePoints: 0, tier: 'BRONZE', multiplier: 1, rewardHistory: [] };
    }
    
    if (!user.loyalty.rewardHistory) {
        user.loyalty.rewardHistory = [];
    }

    user.loyalty.vivaBucks = (user.loyalty.vivaBucks || 0) + rewardPoints;
    user.loyalty.rewardHistory.push({
      type: 'earn',
      points: rewardPoints,
      description: 'Birthday Reward',
      timestamp: new Date(),
      source: 'birthday'
    });

    await user.save();

    return NextResponse.json({
      points: rewardPoints,
      totalPoints: user.loyalty.vivaBucks
    });
  } catch (error) {
    console.error('Error processing birthday reward:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 