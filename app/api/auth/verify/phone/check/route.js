import { NextResponse } from 'next/server';
import { twilioService } from '@/lib/sms/twilioService';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { success: false, message: 'Phone number and code are required.' },
        { status: 400 }
      );
    }

    const verificationCheck = await twilioService.checkVerificationCode(phoneNumber, code);

    if (verificationCheck.status === 'approved') {
      await connectDB();
      
      const user = await User.findOneAndUpdate(
        { phoneNumber: twilioService.formatPhoneNumber(phoneNumber) }, // Ensure we search with the same format Twilio uses
        { 
          isPhoneNumberVerified: true, 
          phoneNumberVerifiedAt: new Date(),
          // Optionally, update smsConsent if it wasn't true before, or ensure phoneNumber is set if somehow missing
          // smsConsent: true, // if verification implies consent
        },
        { new: true } // Return the updated document
      );

      if (!user) {
        // This case might happen if the user changed their phone number after starting verification
        // or if no user record exists for this number (e.g., registration wasn't completed).
        console.warn(`API - Phone verified for ${phoneNumber}, but no user found to update.`);
        return NextResponse.json(
          { success: false, message: 'Phone number verified, but no matching user account found. Please complete registration or contact support.' },
          { status: 404 } // Or 400 depending on how you want to handle this
        );
      }

      console.log(`API - Phone number ${phoneNumber} verified successfully for user ${user.email}`);
      return NextResponse.json({
        success: true,
        message: 'Phone number verified successfully.',
        status: 'approved',
        userId: user._id // Optional: return some user identifier
      });
    } else {
      // Statuses can be 'pending' (if code is incorrect), or other Twilio-specific error statuses.
      console.warn(`API - Phone verification failed for ${phoneNumber}. Status: ${verificationCheck.status}`);
      return NextResponse.json(
        { success: false, message: 'Invalid verification code.', status: verificationCheck.status || 'pending' },
        { status: 400 } // Bad request, as the code was wrong
      );
    }
  } catch (error) {
    console.error('API - Error checking verification code:', error.message, error.stack);
    let errorMessage = 'An error occurred while checking the verification code.';
    if (error.message && error.message.includes('TWILIO_VERIFY_SERVICE_ID')) {
      errorMessage = 'Verification service is not configured. Please contact support.';
    }
    return NextResponse.json(
      { success: false, message: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}
