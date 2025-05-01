import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import SpecialEvent from "@/models/SpecialEvent";

export async function GET(req) {
  try {
    const token = req.nextauth?.token;
    // Middleware ensures token exists and user is ADMIN or MANAGER.
    // This route specifically requires ADMIN.
    if (!token || token.role !== 'ADMIN') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const events = await SpecialEvent.find({})
      .sort({ startDate: -1 });

    return Response.json(events);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const token = req.nextauth?.token;
    // Middleware ensures token exists and user is ADMIN or MANAGER.
    // This route specifically requires ADMIN.
    if (!token || token.role !== 'ADMIN') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const eventData = await req.json();
    
    const event = new SpecialEvent(eventData);
    await event.save();

    return Response.json(event);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 