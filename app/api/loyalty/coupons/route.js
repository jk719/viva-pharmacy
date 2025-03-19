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

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { couponCode } = await req.json();

    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const coupon = user.loyaltyProgram?.coupons?.find(
      c => c.code === couponCode && !c.isUsed && new Date(c.expiryDate) > new Date()
    );

    if (!coupon) {
      return Response.json({ error: "Invalid or expired coupon" }, { status: 400 });
    }

    return Response.json({ amount: coupon.amount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { couponCode } = await req.json();

    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const couponIndex = user.loyaltyProgram?.coupons?.findIndex(
      c => c.code === couponCode && !c.isUsed && new Date(c.expiryDate) > new Date()
    );

    if (couponIndex === -1) {
      return Response.json({ error: "Invalid or expired coupon" }, { status: 400 });
    }

    user.loyaltyProgram.coupons[couponIndex].isUsed = true;
    await user.save();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 