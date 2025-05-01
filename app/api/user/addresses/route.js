import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(request) {
  const token = await getToken({ req: request, secret });

  if (!token || !token.sub) {
    console.error('Authentication failed: Token or sub missing in addresses GET');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = token.sub;

  try {
    await dbConnect();

    const user = await User.findById(userId).select('addresses').lean();

    if (!user) {
      console.error(`User not found for ID: ${userId} in addresses GET`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ addresses: user.addresses || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  const token = await getToken({ req: request, secret });

  if (!token || !token.sub) {
    console.error('Authentication failed: Token or sub missing in addresses POST');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = token.sub;

  try {
    const address = await request.json();

    await dbConnect();
    const user = await User.findById(userId);
    
    if (!user) {
      console.error(`User not found for ID: ${userId} in addresses POST`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    const addressKey = `${address.street}-${address.apartment}-${address.city}-${address.state}-${address.zipCode}`.toLowerCase();
    const isDuplicate = user.addresses.some(addr => {
      const existingKey = `${addr.street}-${addr.apartment}-${addr.city}-${addr.state}-${addr.zipCode}`.toLowerCase();
      return existingKey === addressKey;
    });

    if (isDuplicate) {
      return NextResponse.json({ 
        error: 'This address already exists',
        status: 'duplicate'
      }, { status: 400 });
    }

    const newAddress = {
      fullName: address.fullName,
      street: address.street,
      apartment: address.apartment || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone,
      isDefault: user.addresses.length === 0,
      createdAt: new Date()
    };

    user.addresses.push(newAddress);
    
    await user.save();

    return NextResponse.json({ 
      success: true, 
      address: newAddress
    }, { status: 200 });

  } catch (error) {
    console.error('Error adding address:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}
