import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import SpecialEvent from "@/models/SpecialEvent";

export async function POST(req) {
  try {
    // Middleware should ensure authentication, check for ADMIN role here
    const token = req.nextauth?.token;
    if (!token || token.role !== 'ADMIN') { // Corrected check for ADMIN role
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    const event = await SpecialEvent.create({
      ...data,
      createdBy: token.id // Use token.id
    });

    return Response.json(event, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 