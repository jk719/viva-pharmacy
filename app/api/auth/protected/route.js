import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication required' 
    }, { status: 401 });
  }

  return NextResponse.json({ 
    success: true, 
    user: session.user 
  });
}
