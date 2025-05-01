import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET(req) {
  // Middleware ensures user is authenticated before reaching this route.
  const token = req.nextauth?.token;

  if (!token) {
    // This should theoretically not be reached if middleware is correct
    console.error('Auth token missing in protected route after middleware');
    return NextResponse.json({ success: false, message: 'Authentication error' }, { status: 500 });
  }

  return NextResponse.json({ 
    success: true, 
    user: token // Return the token data (contains user info)
  });
}
