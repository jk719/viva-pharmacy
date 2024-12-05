import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in GET:', session);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    // Find user by email instead of ID
    const user = await User.findOne({ email: session.user.email });
    console.log('Looking for user with email:', session.user.email);
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ addresses: user.addresses || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in GET:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in POST:', session);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const address = await req.json();
    console.log('Received address:', address);

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize addresses array if it doesn't exist
    if (!user.addresses) {
      user.addresses = [];
    }

    // Check for duplicate address
    const addressKey = `${address.street}-${address.apartment}-${address.city}-${address.state}-${address.zipCode}`.toLowerCase();
    const isDuplicate = user.addresses.some(addr => {
      const existingKey = `${addr.street}-${addr.apartment}-${addr.city}-${addr.state}-${addr.zipCode}`.toLowerCase();
      return existingKey === addressKey;
    });

    if (isDuplicate) {
      console.log('Duplicate address detected');
      return new Response(JSON.stringify({ 
        error: 'This address already exists',
        status: 'duplicate'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create new address object
    const newAddress = {
      fullName: address.fullName,
      street: address.street,
      apartment: address.apartment || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone,
      isDefault: user.addresses.length === 0, // Make first address default
      createdAt: new Date()
    };

    // Add new address
    user.addresses.push(newAddress);
    console.log('Saving new address:', newAddress);
    
    await user.save();
    console.log('Address saved successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      address: newAddress
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in POST:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
