import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function PUT(req, context) {
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
    const id = context.params.id;
    const data = await req.json();
    const { name, email, password } = data;

    console.log('Updating manager:', { id, name, email }); // Debug log

    // Find the manager
    const manager = await User.findOne({ _id: id, role: 'MANAGER' });
    if (!manager) {
      return new Response(
        JSON.stringify({ error: 'Manager not found' }), 
        { status: 404 }
      );
    }

    console.log('Before update:', { 
      currentName: manager.name,
      currentEmail: manager.email 
    }); // Debug log

    // Update fields
    if (name !== undefined && name !== null) {
      manager.name = name.trim();
    }
    if (email) {
      manager.email = email.toLowerCase().trim();
    }
    if (password) {
      manager.password = password;
    }

    // Update the lastUpdated timestamp
    manager.updatedAt = new Date();

    // Save the changes
    const updatedManager = await manager.save();

    console.log('After update:', { 
      newName: updatedManager.name,
      newEmail: updatedManager.email 
    }); // Debug log

    return new Response(
      JSON.stringify({ 
        message: 'Manager updated successfully',
        manager: {
          id: updatedManager._id,
          email: updatedManager.email,
          name: updatedManager.name,
          role: updatedManager.role,
          createdAt: updatedManager.createdAt,
          updatedAt: updatedManager.updatedAt
        }
      }), 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating manager:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update manager',
        details: error.message 
      }), 
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
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
    const id = context.params.id;

    console.log('Attempting to delete manager:', id);

    // Find and delete the manager
    const result = await User.deleteOne({ _id: id, role: 'MANAGER' });
    
    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Manager not found' }), 
        { status: 404 }
      );
    }

    console.log('Successfully deleted manager:', id);

    return new Response(
      JSON.stringify({ message: 'Manager deleted successfully' }), 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting manager:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to delete manager',
        details: error.message 
      }), 
      { status: 500 }
    );
  }
} 