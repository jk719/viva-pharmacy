import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import Order from '@/models/Order';

export async function GET(req) {
  try {
    // Middleware already ensures user is authenticated and has ADMIN or PHARMACIST role for this path.
    // const token = req.nextauth?.token;

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