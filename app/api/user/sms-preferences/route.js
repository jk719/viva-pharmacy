import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id)
      .select('smsPreferences phoneNumber addresses')
      .lean();

    // Get phone number from either root level or default address
    const phoneNumber = user.phoneNumber || 
      (user.addresses?.find(addr => addr.isDefault)?.phone) || 
      (user.addresses?.[0]?.phone);

    return NextResponse.json({
      smsPreferences: user.smsPreferences,
      phoneNumber
    });
  } catch (error) {
    console.error('Error fetching SMS preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMS preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    const user = await User.findById(session.user.id);
    user.smsPreferences = body.smsPreferences;
    await user.save();

    return NextResponse.json({
      message: 'SMS preferences updated successfully',
      smsPreferences: user.smsPreferences
    });
  } catch (error) {
    console.error('Error updating SMS preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update SMS preferences' },
      { status: 500 }
    );
  }
} 