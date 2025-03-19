import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { startDate, endDate } = await req.json();

    // Get program growth data
    const growthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Get tier distribution
    const tierData = await User.aggregate([
      {
        $group: {
          _id: "$loyaltyProgram.tier",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get points economy data
    const pointsData = await User.aggregate([
      {
        $unwind: "$loyaltyProgram.transactions"
      },
      {
        $match: {
          "loyaltyProgram.transactions.createdAt": {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: "$loyaltyProgram.transactions.type",
          total: { $sum: "$loyaltyProgram.transactions.points" }
        }
      }
    ]);

    return Response.json({
      growth: {
        labels: growthData.map(d => d._id),
        datasets: [{
          label: 'New Members',
          data: growthData.map(d => d.count)
        }]
      },
      tiers: {
        labels: tierData.map(d => d._id || 'None'),
        datasets: [{
          data: tierData.map(d => d.count)
        }]
      },
      points: {
        labels: ['Earned', 'Redeemed'],
        datasets: [{
          label: 'Points',
          data: [
            pointsData.find(d => d._id === 'earn')?.total || 0,
            pointsData.find(d => d._id === 'redeem')?.total || 0
          ]
        }]
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 