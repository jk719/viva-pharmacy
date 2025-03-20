import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Order from '@/models/Order';
import dbConnect from '@/lib/dbConnect';

export async function POST(req) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const prescriptionImage = formData.get('prescriptionImage'); // This is now a URL
    const details = JSON.parse(formData.get('details'));

    // Create prescription order
    const order = await Order.create({
      userId: session.user.id,
      isPrescriptionOrder: true,
      prescriptionDetails: {
        prescriptionImage, // Firebase Storage URL
        doctorName: details.doctorName,
        doctorContact: details.doctorContact,
        pharmacy: details.pharmacy,
        verificationStatus: 'Pending',
        uploadDate: new Date(),
      },
      status: 'Pending',
      orderNumber: `RX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    return NextResponse.json({
      success: true,
      prescriptionId: order._id,
      message: 'Prescription uploaded successfully'
    });

  } catch (error) {
    console.error('Prescription upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process prescription' },
      { status: 500 }
    );
  }
}

// Add GET method to fetch user's prescriptions
export async function GET(req) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const prescriptions = await Order.find({
      userId: session.user.id,
      isPrescriptionOrder: true
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      prescriptions
    });

  } catch (error) {
    console.error('Fetch prescriptions error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
} 