import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { calculateMetrics, calculateTrendData } from "@/lib/loyalty/analyticsService";

export async function GET(req) {
  try {
    const token = req.nextauth?.token;
    // Middleware ensures token exists and user is ADMIN or MANAGER.
    // This route specifically requires ADMIN.
    if (!token || token.role !== 'ADMIN') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Fetch all users with loyalty program data
    const users = await User.find({})
      .select('loyaltyProgram')
      .lean();

    // Calculate metrics
    const metrics = calculateMetrics(users);

    // Get all transactions for trend analysis
    const transactions = users.flatMap(user => 
      user.loyaltyProgram?.transactions || []
    );

    // Calculate trend data
    const trends = calculateTrendData(transactions, days);

    return Response.json({
      metrics,
      trends
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 