import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(request) {
  const token = await getToken({ req: request, secret });
  console.log('SMS Pref GET handler getToken result:', JSON.stringify(token, null, 2));

  if (!token || !token.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(token.sub)
      .select('smsPreferences phoneNumber addresses')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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

export async function PUT(request) {
  const token = await getToken({ req: request, secret });
  console.log('SMS Pref PUT handler getToken result:', JSON.stringify(token, null, 2));

  if (!token || !token.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    await dbConnect();

    const user = await User.findById(token.sub);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
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