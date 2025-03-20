import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Order from '@/models/Order';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const order = await Order.findOne({
      _id: params.id,
      userId: session.user.id,
      isPrescriptionOrder: true
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Prescription not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: order.prescriptionDetails.verificationStatus,
      prescription: {
        doctorName: order.prescriptionDetails.doctorName,
        verifiedBy: order.prescriptionDetails.verifiedBy,
        verificationNotes: order.prescriptionDetails.verificationNotes
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check status' },
      { status: 500 }
    );
  }
} 