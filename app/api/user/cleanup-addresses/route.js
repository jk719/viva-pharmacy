import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const user = await User.findOne({ email: 'y3jamil@gmail.com' });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create a map to store unique addresses
    const uniqueAddresses = new Map();
    
    // Filter out duplicates
    user.addresses.forEach(addr => {
      const key = `${addr.street}-${addr.apartment}-${addr.city}-${addr.state}-${addr.zipCode}`.toLowerCase();
      if (!uniqueAddresses.has(key)) {
        uniqueAddresses.set(key, addr);
      }
    });

    // Convert back to array
    user.addresses = Array.from(uniqueAddresses.values());
    
    // Ensure only one default address
    let hasDefault = false;
    user.addresses = user.addresses.map(addr => {
      if (addr.isDefault && !hasDefault) {
        hasDefault = true;
        return addr;
      }
      return { ...addr, isDefault: false };
    });

    // If no default address, set the first one as default
    if (!hasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({ 
      success: true,
      addressCount: user.addresses.length,
      addresses: user.addresses 
    }, { status: 200 });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 