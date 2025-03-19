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
    const { amount } = await req.json();

    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const benefits = await LoyaltyCheckoutService.calculateLoyaltyBenefits(
      user,
      amount
    );

    return Response.json(benefits);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 