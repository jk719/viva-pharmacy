import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount } = await request.json();
    
    // Temporary response until we implement Stripe
    return NextResponse.json({ 
      message: 'Payment route ready for Stripe implementation'
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Error processing payment' },
      { status: 500 }
    );
  }
}
