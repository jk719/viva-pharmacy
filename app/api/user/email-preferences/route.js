import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(request) {
  const token = request.nextauth?.token;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(token.sub)
      .select('emailPreferences')
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ emailPreferences: user.emailPreferences });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const token = request.nextauth?.token;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { emailPreferences } = await request.json();

    const user = await User.findById(token.sub);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.emailPreferences = {
      ...user.emailPreferences,
      ...emailPreferences
    };

    await user.save();

    return NextResponse.json({ 
      message: "Preferences updated successfully",
      emailPreferences: user.emailPreferences 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 