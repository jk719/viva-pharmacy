import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Removed
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
// import { authOptions } from '@/lib/auth'; // Removed

export async function GET(request) { // Added request parameter
  const token = request.nextauth?.token; // Added

  // Use token for authorization
  if (!token || !token.email) { // Modified: Check for token and token.email
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication required' 
    }, { status: 401 });
  }

  try {
    // const session = await getServerSession(authOptions); // Removed
    // if (!session) { // Removed
    //   return NextResponse.json({ // Removed
    //     success: false, // Removed
    //     message: 'Authentication required' // Removed
    //   }, { status: 401 }); // Removed
    // } // Removed

    await dbConnect();
    const user = await User.findOne({ email: token.email }) // Modified: Use token.email
      .select('-password');

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch user profile' 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  const token = request.nextauth?.token; // Added

  // Use token for authorization
  if (!token || !token.email) { // Modified: Check for token and token.email
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication required' 
    }, { status: 401 });
  }

  try {
    // const session = await getServerSession(authOptions); // Removed
    // if (!session) { // Removed
    //   return NextResponse.json({ // Removed
    //     success: false, // Removed
    //     message: 'Authentication required' // Removed
    //   }, { status: 401 }); // Removed
    // } // Removed

    const body = await request.json();
    await dbConnect();

    const user = await User.findOne({ email: token.email }); // Modified: Use token.email
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Update allowed fields
    if (body.phoneNumber) user.phoneNumber = body.phoneNumber;
    // Add other updatable fields as needed

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update profile' 
    }, { status: 500 });
  }
}
