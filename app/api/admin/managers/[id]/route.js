import { NextResponse } from 'next/server';
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function DELETE(request, context) {
  try {
    const token = request.nextauth?.token;
    // Middleware ensures token exists and user is ADMIN or MANAGER.
    // This route specifically requires ADMIN.
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle params asynchronously like in the products route
    const id = await Promise.resolve(context.params).then(p => p.id);
    console.log('Attempting to delete manager:', id);

    await dbConnect();

    const manager = await User.findOne({ _id: id, role: 'MANAGER' });
    if (!manager) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
    }

    await User.findByIdAndDelete(id);
    console.log('Successfully deleted manager:', id);

    return NextResponse.json({ message: 'Manager deleted successfully' });

  } catch (error) {
    console.error('Error deleting manager:', error);
    return NextResponse.json(
      { error: 'Failed to delete manager' },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    const token = request.nextauth?.token;
    // Middleware ensures token exists and user is ADMIN or MANAGER.
    // This route specifically requires ADMIN.
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle params asynchronously like in the products route
    const id = await Promise.resolve(context.params).then(p => p.id);
    const data = await request.json();

    await dbConnect();

    const manager = await User.findOneAndUpdate(
      { _id: id, role: 'MANAGER' },
      { $set: data },
      { new: true }
    );

    if (!manager) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Manager updated successfully',
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role
      }
    });

  } catch (error) {
    console.error('Error updating manager:', error);
    return NextResponse.json(
      { error: 'Failed to update manager' },
      { status: 500 }
    );
  }
} 