import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req) {
  try {
    console.log('🔵 Profile fetch request received');
    
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('❌ No session found');
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
      });
    }
    console.log('✅ Session verified for user:', session.user.email);

    await dbConnect();
    console.log('✅ Database connected');

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      console.log('❌ User not found');
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    console.log('✅ User fetched successfully:', {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      addresses: user.addresses
    });

    return new Response(JSON.stringify(user), {
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function PUT(req) {
  try {
    console.log('🔵 Profile update request received');
    
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('❌ No session found');
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
      });
    }
    console.log('✅ Session verified for user:', session.user.email);

    await dbConnect();
    console.log('✅ Database connected');
    
    const data = await req.json();
    console.log('📝 Update data received:', JSON.stringify(data, null, 2));

    // Format phone number - remove all non-digits
    const formattedPhone = data.phone.replace(/\D/g, '');

    // Find the user
    let user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.log('❌ User not found');
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Create or update the default address
    const addressData = {
      fullName: `${data.firstName} ${data.lastName}`,
      street: data.address.street,
      city: data.address.city,
      state: data.address.state,
      zipCode: data.address.zipCode,
      phone: formattedPhone,
      isDefault: true
    };

    // Find existing default address or create new one
    const defaultAddressIndex = user.addresses.findIndex(addr => addr.isDefault);
    if (defaultAddressIndex >= 0) {
      // Update existing default address
      user.addresses[defaultAddressIndex] = {
        ...user.addresses[defaultAddressIndex].toObject(),
        ...addressData
      };
    } else {
      // Add new default address
      user.addresses.push(addressData);
    }

    // Update user's phone number
    user.phoneNumber = formattedPhone;

    // Save the user
    await user.save();

    console.log('✅ User updated successfully:', {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      addresses: user.addresses
    });

    return new Response(JSON.stringify({ 
      user: user.toJSON(), 
      message: "Profile updated successfully" 
    }), {
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error.message);
    if (error.name === 'ValidationError') {
      return new Response(JSON.stringify({ 
        error: "Validation Error", 
        details: error.message 
      }), {
        status: 400,
      });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
} 