import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Removed
// import { authOptions } from '@/lib/auth'; // Removed
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function GET(request) {
  const token = request.nextauth?.token; // Added: Get token from middleware

  // Check for authorization using token
  if (!token || !token.role || !['ADMIN', 'MANAGER'].includes(token.role)) { // Modified: Use token for role check
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // const session = await getServerSession(authOptions); // Removed
    // if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) { // Removed
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Removed
    // } // Removed

    await dbConnect();

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || searchParams.get('range') || 'week';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Fetch orders within date range
    const orders = await Order.find({
      createdAt: { $gte: startDate }
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    const stats = {
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      pendingOrders: orders.filter(order => order.status === 'Pending').length,
      statusDistribution: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}),
      deliveryMethodDistribution: orders.reduce((acc, order) => {
        acc[order.deliveryMethod] = (acc[order.deliveryMethod] || 0) + 1;
        return acc;
      }, {}),
      trends: generateTrends(orders, timeframe)
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function generateTrends(orders, timeframe) {
  // Group orders by date and calculate daily totals
  const trends = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, orders: 0, revenue: 0 };
    }
    acc[date].orders++;
    acc[date].revenue += order.total || 0;
    return acc;
  }, {});

  return Object.values(trends);
} 