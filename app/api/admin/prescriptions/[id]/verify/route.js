import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Order from '@/models/Order';
import { sendPrescriptionNotification } from '@/lib/notifications';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'PHARMACIST'].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { approved, note } = await req.json();

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Prescription not found' }, { status: 404 });
    }

    order.prescriptionDetails.verificationStatus = approved ? 'Verified' : 'Rejected';
    order.prescriptionDetails.verifiedBy = session.user.id;
    order.prescriptionDetails.verificationNotes = note;
    await order.save();

    // Send notification to user
    await sendPrescriptionNotification({
      userId: order.userId,
      status: approved ? 'verified' : 'rejected',
      prescriptionId: order._id,
      note
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Verification action error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process verification' },
      { status: 500 }
    );
  }
} 