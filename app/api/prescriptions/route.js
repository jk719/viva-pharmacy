import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import Order from '@/models/Order';
import dbConnect from '@/lib/dbConnect';
import { sendNotification } from '@/lib/notifications';
import User from '@/models/User';
import { prescriptionTracker } from '@/lib/tracking/prescriptionTracker';

export async function POST(req) {
  try {
    await dbConnect();
    
    // Middleware ensures user is authenticated
    const token = req.nextauth?.token;
    if (!token?.id) {
      console.error('Token or user ID missing in prescription POST after middleware');
      return NextResponse.json({ success: false, message: 'Authentication Error' }, { status: 500 });
    }

    const formData = await req.formData();
    const prescriptionImage = formData.get('prescriptionImage');
    const details = JSON.parse(formData.get('details') || '{}');

    // Get the user to access their default address
    const user = await User.findById(token.id).select('addresses');
    const defaultAddress = user?.addresses?.find(addr => addr.isDefault) || user?.addresses[0];

    if (!defaultAddress) {
      return NextResponse.json(
        { success: false, message: 'Please add a shipping address to your profile' },
        { status: 400 }
      );
    }

    // Create prescription order
    const order = await Order.create({
      userId: token.id,
      orderNumber: `RX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      items: [],
      total: 0,
      status: 'Pending',
      deliveryMethod: 'delivery',
      selectedTime: 'pending',
      shippingAddress: {
        street: defaultAddress.street,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zipCode: defaultAddress.zipCode,
        country: 'US'
      },
      paymentIntentId: `pi_rx_${Date.now()}`,
      isPrescriptionOrder: true,
      prescriptionDetails: {
        verificationStatus: 'Pending',
        prescriptionImage,
        doctorName: details.doctorName,
        doctorContact: details.doctorContact,
        pharmacy: details.pharmacy,
        uploadDate: new Date()
      }
    });

    try {
      // Track the prescription event
      await prescriptionTracker.trackEvent('PRESCRIPTION_UPLOADED', {
        prescriptionId: order._id,
        userId: token.id,
        metadata: {
          doctorName: details.doctorName,
          status: 'Pending'
        }
      });
    } catch (trackingError) {
      // Log but don't fail if tracking fails
      console.error('Tracking error:', trackingError);
    }

    try {
      // Send notification
      await sendNotification('PRESCRIPTION_UPLOADED', {
        userId: token.id,
        prescriptionId: order._id
      });
    } catch (notificationError) {
      // Log but don't fail if notification fails
      console.error('Notification error:', notificationError);
    }

    return NextResponse.json({
      success: true,
      prescriptionId: order._id,
      message: 'Prescription uploaded successfully'
    });

  } catch (error) {
    console.error('Prescription upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process prescription',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Add GET method to fetch user's prescriptions
export async function GET(req) {
  try {
    await dbConnect();
    
    // Middleware ensures user is authenticated
    const token = req.nextauth?.token;
    if (!token?.id) {
      console.error('Token or user ID missing in prescription GET after middleware');
      return NextResponse.json({ success: false, message: 'Authentication Error' }, { status: 500 });
    }

    const prescriptions = await Order.find({
      userId: token.id,
      isPrescriptionOrder: true
    })
    .sort({ createdAt: -1 })
    .select('prescriptionDetails status createdAt orderNumber');

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