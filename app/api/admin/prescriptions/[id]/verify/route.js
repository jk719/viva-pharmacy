import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import Order from '@/models/Order';
import { sendPrescriptionNotification } from '@/lib/notifications';

export async function POST(req, { params }) {
  try {
    // Middleware ensures user is authenticated and has ADMIN or PHARMACIST role
    const token = req.nextauth?.token;
    if (!token?.id) {
      console.error('Token or user ID missing in verify prescription POST after middleware');
      return NextResponse.json({ success: false, message: 'Authentication Error' }, { status: 500 });
    }

    const { approved, note } = await req.json();

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Prescription not found' }, { status: 404 });
    }

    order.prescriptionDetails.verificationStatus = approved ? 'Verified' : 'Rejected';
    order.prescriptionDetails.verifiedBy = token.id;
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