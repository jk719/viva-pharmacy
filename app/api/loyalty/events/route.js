import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import SpecialEvent from "@/models/SpecialEvent";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role !== 'ADMIN') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    const event = await SpecialEvent.create({
      ...data,
      createdBy: session.user.id
    });

    return Response.json(event, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 