import { authOptions } from '@/lib/auth';
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

// Add cache control headers to all responses
const CACHE_CONTROL_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export async function GET(req) {
  try {
    console.log('🔵 Profile fetch request received');
    
    // Get token directly within the handler
    const token = await getToken({ req, secret });
    console.log('Profile GET handler getToken result:', JSON.stringify(token, null, 2));

    if (!token || !token.email) {
        console.log('❌ Token or email missing in handler (getToken failed or invalid token)');
        return new Response(JSON.stringify({ error: "Authentication failed" }), { 
          status: 401,
          headers: CACHE_CONTROL_HEADERS
        });
    }
    console.log('✅ Handler retrieved token for user:', token.email);

    await dbConnect();
    const user = await User.findById(token.id).select(
      '_id name email phone vivaBucks cumulativeVivaBucks currentTier vivaBucksMultiplier isVerified role'
    );

    if (!user) {
      console.log('❌ User not found in database:', token.id);
      return new Response(JSON.stringify({ error: "User not found" }), { 
        status: 404,
        headers: CACHE_CONTROL_HEADERS
      });
    }

    // Ensure all needed fields are populated with defaults if missing
    const userData = user.toObject();
    userData.vivaBucks = userData.vivaBucks || 0;
    userData.cumulativeVivaBucks = userData.cumulativeVivaBucks || 0;
    userData.currentTier = userData.currentTier || 'BRONZE';
    userData.vivaBucksMultiplier = userData.vivaBucksMultiplier || 1;
    
    // Add timestamp for cache validation
    userData.timestamp = new Date().toISOString();

    console.log('✅ User data retrieved successfully for:', user.email, {
      vivaBucks: userData.vivaBucks,
      cumulativeVivaBucks: userData.cumulativeVivaBucks,
      currentTier: userData.currentTier
    });

    return new Response(JSON.stringify(userData), { 
      status: 200,
      headers: CACHE_CONTROL_HEADERS
    });
  } catch (error) {
    console.error('❌ Error in profile API:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: CACHE_CONTROL_HEADERS 
    });
  }
}

export async function PUT(req) {
  try {
    console.log('🔵 Profile update request received');

    // Get token directly within the handler
    const token = await getToken({ req, secret });
    console.log('Profile PUT handler getToken result:', JSON.stringify(token, null, 2));

    if (!token || !token.email) {
        console.log('❌ Token or email missing in handler (getToken failed or invalid token)');
        return new Response(JSON.stringify({ error: "Authentication failed" }), { status: 401 });
    }
    console.log('✅ Handler retrieved token for user:', token.email);

    await dbConnect();
    console.log('✅ Database connected');
    
    const data = await req.json();
    console.log('📝 Update data received:', JSON.stringify(data, null, 2));

    // Format phone number - remove all non-digits and ensure +1 prefix
    let formattedPhone = data.phone.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '+1' + formattedPhone;
    } else if (!formattedPhone.startsWith('+1')) {
      formattedPhone = '+1' + formattedPhone;
    }

    // Find the user
    let user = await User.findOne({ email: token.email });
    
    if (!user) {
      console.log('❌ User not found');
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Update user's basic information
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    user.name = fullName; // Set the required name field
    user.phoneNumber = formattedPhone;

    // Create or update the default address
    const addressData = {
      fullName: fullName,
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

    // Save the user
    await user.save();

    console.log('✅ User updated successfully:', {
      id: user._id,
      email: user.email,
      name: user.name,
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