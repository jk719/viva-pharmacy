import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { emailService } from '@/lib/email/emailService';

export async function POST(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the request body
    const { template, email, data } = await request.json();
    
    // Validate inputs
    if (!template || !email || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!emailService.hasTemplate(template)) {
      return NextResponse.json(
        { error: 'Invalid template name' },
        { status: 400 }
      );
    }
    
    // Send the test email
    await emailService.sendTestEmail(email, template, data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
} 