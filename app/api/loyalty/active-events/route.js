import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import SpecialEvent from "@/models/SpecialEvent";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const activeEvents = await SpecialEvent.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true
    }).sort({ pointMultiplier: -1 }).lean();

    return Response.json({ events: activeEvents || [] });
  } catch (error) {
    console.error('Error fetching active events:', error);
    return Response.json({ error: error.message, events: [] }, { status: 500 });
  }
} 