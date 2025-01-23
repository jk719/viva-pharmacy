import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }), 
        { status: 403 }
      );
    }

    await dbConnect();
    const data = await req.json();
    const { email, password, name } = data;

    console.log('Creating manager with data:', { email, name }); // Debug log

    // Validate input
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email already registered' }), 
        { status: 400 }
      );
    }

    // Create manager account
    const manager = new User({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      role: 'MANAGER',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await manager.save();
    console.log('Created manager:', { id: manager._id, name: manager.name }); // Debug log

    return new Response(
      JSON.stringify({ 
        message: 'Manager account created successfully',
        manager: {
          id: manager._id,
          email: manager.email,
          name: manager.name,
          role: manager.role,
          createdAt: manager.createdAt,
          updatedAt: manager.updatedAt
        }
      }), 
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating manager:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create manager account' }), 
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }), 
        { status: 403 }
      );
    }

    await dbConnect();

    // Get all managers with explicit field selection
    const managers = await User.find(
      { role: 'MANAGER' },
      {
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1
      }
    ).lean();

    console.log('Raw managers from DB:', managers); // Debug log

    // Transform the data to ensure consistent ID field
    const transformedManagers = managers.map(manager => ({
      _id: manager._id.toString(), // Ensure ID is a string
      id: manager._id.toString(),  // Include both _id and id
      name: manager.name || '',
      email: manager.email,
      role: manager.role,
      createdAt: manager.createdAt,
      updatedAt: manager.updatedAt || manager.createdAt
    }));

    console.log('Transformed managers:', transformedManagers); // Debug log

    return new Response(
      JSON.stringify({ managers: transformedManagers }), 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching managers:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch managers' }), 
      { status: 500 }
    );
  }
} 