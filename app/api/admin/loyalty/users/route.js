import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');
    
    let query = {};
    
    switch (filter) {
      case 'active':
        query = { 'loyaltyProgram.points': { $gt: 0 } };
        break;
      case 'inactive':
        query = { 
          $or: [
            { 'loyaltyProgram.points': 0 },
            { 'loyaltyProgram.points': { $exists: false } }
          ]
        };
        break;
      case 'silver':
      case 'gold':
      case 'platinum':
      case 'sapphire':
      case 'diamond':
      case 'legend':
        query = { 'loyaltyProgram.tier': filter.toUpperCase() };
        break;
    }

    const users = await User.find(query)
      .select('name email loyaltyProgram')
      .sort({ 'loyaltyProgram.points': -1 });

    return Response.json(users);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 