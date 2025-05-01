import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Removed
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
// import { authOptions } from '@/lib/auth'; // Removed
import { sendOrderEmail } from '@/lib/email/sendEmail';

export async function POST(request, { params }) {
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

    const { content } = await request.json();
    
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Email content is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await Order.findById(params.id)
      .populate('userId', 'email name');
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Send email
    await sendOrderEmail({
      to: order.userId.email,
      subject: `Update regarding your order #${order.orderNumber}`,
      content
    });

    // Add email to notes
    const note = {
      content,
      author: token.name || token.email, // Modified: Use token data for author
      type: 'email',
      createdAt: new Date()
    };

    order.notes = order.notes || [];
    order.notes.push(note);
    await order.save();

    return NextResponse.json({ success: true, note });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 