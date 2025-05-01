import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Removed
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
// import { authOptions } from '@/lib/auth'; // Removed

export async function GET(request, context) {
  const token = request.nextauth?.token; // Added
  
  // Use token for authorization
  if (!token || !token.role || !['ADMIN', 'MANAGER'].includes(token.role)) { // Modified
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // const session = await getServerSession(authOptions); // Removed
    // if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) { // Removed
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); // Removed
    // } // Removed

    const orderId = await Promise.resolve(context.params).then(p => p.id);
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId)
      .select('notes')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ notes: order.notes || [] });

  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request, context) {
  const token = request.nextauth?.token; // Added

  // Use token for authorization
  if (!token || !token.role || !['ADMIN', 'MANAGER'].includes(token.role)) { // Modified
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // const session = await getServerSession(authOptions); // Removed
    // if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) { // Removed
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); // Removed
    // } // Removed

    const orderId = await Promise.resolve(context.params).then(p => p.id);
    const { content } = await request.json();
    
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const note = {
      content,
      author: token.name || token.email, // Modified: Use token data for author
      type: 'internal',
      createdAt: new Date()
    };

    order.notes = order.notes || [];
    order.notes.push(note);
    await order.save();

    return NextResponse.json({ success: true, note });

  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    );
  }
} 