import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { ExportService, EXPORT_FORMATS } from "@/lib/export/exportService";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || EXPORT_FORMATS.CSV;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Fetch users with loyalty data
    const users = await User.find(query)
      .select('name email loyaltyProgram createdAt')
      .lean();

    // Format data for export
    const exportData = users.map(user => ({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      tier: user.loyaltyProgram?.tier || 'None',
      points: user.loyaltyProgram?.points || 0,
      totalSpent: user.loyaltyProgram?.transactions?.reduce((sum, t) => 
        t.type === 'earn' ? sum + t.amount : sum, 0) || 0,
      activeCoupons: user.loyaltyProgram?.coupons?.filter(c => !c.isUsed).length || 0,
      usedCoupons: user.loyaltyProgram?.coupons?.filter(c => c.isUsed).length || 0,
      lastActivity: user.loyaltyProgram?.transactions?.[0]?.createdAt || null,
      joinDate: user.createdAt
    }));

    // Generate export file
    const exportedData = await ExportService.formatLoyaltyData(exportData, format);

    // Set appropriate headers based on format
    const headers = new Headers();
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format) {
      case EXPORT_FORMATS.CSV:
        headers.set('Content-Type', 'text/csv');
        headers.set('Content-Disposition', `attachment; filename=loyalty-data-${timestamp}.csv`);
        return new Response(exportedData, { headers });
      
      case EXPORT_FORMATS.EXCEL:
        headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        headers.set('Content-Disposition', `attachment; filename=loyalty-data-${timestamp}.xlsx`);
        return new Response(exportedData, { headers });
      
      case EXPORT_FORMATS.JSON:
        headers.set('Content-Type', 'application/json');
        headers.set('Content-Disposition', `attachment; filename=loyalty-data-${timestamp}.json`);
        return new Response(exportedData, { headers });
      
      default:
        return Response.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 