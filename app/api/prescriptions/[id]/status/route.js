import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import Order from '@/models/Order';

export async function GET(req, { params }) {
  try {
    // Middleware ensures user is authenticated
    const token = req.nextauth?.token;
    if (!token?.id) {
      console.error('Token or user ID missing in prescription status GET after middleware');
      return NextResponse.json({ success: false, message: 'Authentication Error' }, { status: 500 });
    }

    const order = await Order.findOne({
      _id: params.id,
      userId: token.id, // Use token.id
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