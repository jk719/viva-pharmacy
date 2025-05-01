import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import Order from '@/models/Order';

export async function GET(req) {
  try {
    // Middleware already ensures user is authenticated and has ADMIN or PHARMACIST role for this path.
    // const token = req.nextauth?.token;

    const stats = await Order.aggregate([
      { 
        $match: { 
          isPrescriptionOrder: true 
        } 
      },
      {
        $group: {
          _id: '$prescriptionDetails.verificationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      verified: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id.toLowerCase()] = stat.count;
    });

    return NextResponse.json({
      success: true,
      stats: formattedStats
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 