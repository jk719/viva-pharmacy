import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id)
      .select('emailPreferences')
      .lean();

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ emailPreferences: user.emailPreferences });
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
    const { emailPreferences } = await req.json();

    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    user.emailPreferences = {
      ...user.emailPreferences,
      ...emailPreferences
    };

    await user.save();

    return Response.json({ 
      message: "Preferences updated successfully",
      emailPreferences: user.emailPreferences 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 