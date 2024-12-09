import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    const { points } = data;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add test points
    const result = await user.addPoints(points);
    
    console.log('🔵 Test points added:', points);
    console.log('✅ Updated user data:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error adding test points:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 