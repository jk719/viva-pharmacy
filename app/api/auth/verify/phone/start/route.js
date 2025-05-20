import { NextResponse } from 'next/server';
import { twilioService } from '@/lib/sms/twilioService';

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required.' },
        { status: 400 }
      );
    }

    // Basic validation for phone number format can be added here if desired,
    // though twilioService.formatPhoneNumber will handle formatting for Twilio.

    const verification = await twilioService.startPhoneNumberVerification(phoneNumber);

    // Twilio Verify returns 'pending' when OTP is sent, or 'approved' if already verified by a recent attempt or still valid.
    if (verification.status === 'pending' || verification.status === 'approved') { 
      return NextResponse.json({
        success: true,
        message: 'Verification code sent successfully.',
        status: verification.status, // e.g., 'pending'
        sid: verification.sid // Optional: can be useful for debugging or tracking
      });
    } else {
      // Handle other unexpected statuses from Twilio if necessary
      console.warn('API - Unexpected Twilio verification status on start:', verification);
      return NextResponse.json(
        { success: false, message: 'Failed to start phone verification.', details: verification.status },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API - Error starting phone verification:', error.message, error.stack);
    // Normalize error messages for client
    let errorMessage = 'An error occurred while trying to send verification code.';
    if (error.message && error.message.includes('TWILIO_VERIFY_SERVICE_ID')) {
      errorMessage = 'Verification service is not configured. Please contact support.';
    }
    // Consider more specific error handling based on Twilio error codes if needed
    return NextResponse.json(
      { success: false, message: errorMessage, details: error.message }, // Avoid sending full stack trace to client
      { status: 500 }
    );
  }
}
