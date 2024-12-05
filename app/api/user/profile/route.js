import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }), 
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await req.json();

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        name: data.name,
        phone: data.phone 
      },
      { new: true }
    );

    return new Response(
      JSON.stringify({ message: "Profile updated successfully" }), 
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to update profile" }), 
      { status: 500 }
    );
  }
} 