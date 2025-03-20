import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Order from '@/models/Order';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'PHARMACIST'].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const prescriptions = await Order.find({
      isPrescriptionOrder: true,
      'prescriptionDetails.verificationStatus': 'Pending'
    })
    .sort({ createdAt: -1 })
    .limit(50);

    return NextResponse.json({
      success: true,
      prescriptions: prescriptions.map(p => ({
        id: p._id,
        doctorName: p.prescriptionDetails.doctorName,
        doctorContact: p.prescriptionDetails.doctorContact,
        prescriptionImage: p.prescriptionDetails.prescriptionImage,
        pharmacy: p.prescriptionDetails.pharmacy,
        patientName: p.userId.name, // Assuming user info is populated
        createdAt: p.createdAt
      }))
    });

  } catch (error) {
    console.error('Admin prescriptions error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
} 