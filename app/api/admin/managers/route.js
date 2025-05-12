import { NextResponse } from 'next/server';
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateVerificationToken } from '@/lib/tokens';
import { emailService } from '@/lib/email/emailService';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const token = request.nextauth?.token;
    // Middleware ensures token exists and user is ADMIN or MANAGER.
    // This route specifically requires ADMIN.
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { email, name } = data;

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    console.log('Generated verification token:', verificationToken.substring(0, 10) + '...');

    // Create new manager without password
    const newManager = new User({
      email: email.toLowerCase(),
      name,
      role: 'MANAGER',
      verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isVerified: false,
      mustChangePassword: true
    });

    await newManager.save();
    console.log('Manager saved with token:', {
      email: newManager.email,
      tokenLength: verificationToken.length,
      expires: newManager.verificationExpires
    });

    // Use emailService directly instead of adapter
    await emailService.sendAdminWelcomeEmail(
      { email, name },
      { verificationToken, role: 'MANAGER' }
    );

    return NextResponse.json({
      message: 'Manager created successfully',
      manager: {
        id: newManager._id,
        email: newManager.email,
        name: newManager.name,
        role: newManager.role,
        createdAt: newManager.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating manager:', error);
    return NextResponse.json(
      { error: 'Failed to create manager' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const token = request.nextauth?.token;
    // Middleware ensures token exists and user is ADMIN or MANAGER.
    // This route specifically requires ADMIN.
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const managers = await User.find({ role: 'MANAGER' });
    console.log('Raw managers from DB:', managers);

    const transformedManagers = managers.map(manager => ({
      _id: manager._id.toString(),
      id: manager._id.toString(),
      name: manager.name,
      email: manager.email,
      role: manager.role,
      createdAt: manager.createdAt,
      updatedAt: manager.updatedAt
    }));

    console.log('Transformed managers:', transformedManagers);

    // Return with managers property
    return NextResponse.json({ managers: transformedManagers });
  } catch (error) {
    console.error('Error fetching managers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch managers' },
      { status: 500 }
    );
  }
} 