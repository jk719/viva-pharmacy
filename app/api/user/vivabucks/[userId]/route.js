import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request) {
  try {
    await dbConnect();
    const userId = request.url.split('/').pop();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ vivaBucks: user.vivaBucks || 0 });
  } catch (error) {
    console.error('Error fetching VivaBucks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 