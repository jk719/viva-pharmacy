import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Order from '@/models/Order';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'PHARMACIST'].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

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