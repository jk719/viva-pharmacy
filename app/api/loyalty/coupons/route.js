import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Filter valid coupons
    const validCoupons = user.loyaltyProgram?.coupons?.filter(
      coupon => !coupon.isUsed && new Date(coupon.expiryDate) > new Date()
    ) || [];

    return Response.json({ coupons: validCoupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return Response.json({ error: "Failed to fetch coupons", coupons: [] }, { status: 500 });
  }
} 