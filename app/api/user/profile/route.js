import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
      });
    }

    await dbConnect();
    const data = await req.json();

    // Update user profile
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      { new: true }
    );

    return new Response(JSON.stringify(user), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
} 