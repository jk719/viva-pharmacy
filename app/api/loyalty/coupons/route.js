import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(request) {
  const token = request.nextauth?.token;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(token.sub)
      .select('loyalty.coupons')
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const validCoupons = user.loyalty?.coupons?.filter(
      coupon => !coupon.isUsed && new Date(coupon.expiryDate) > new Date()
    ) || [];

    return NextResponse.json({ coupons: validCoupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: "Failed to fetch coupons", coupons: [] }, { status: 500 });
  }
} 