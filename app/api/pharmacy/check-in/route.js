import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { PharmacyEmployee, ActiveSession } from '@/models/PharmacyEmployee';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await dbConnect();
    
    const { employeeId, pin } = await req.json();
    
    const employee = await PharmacyEmployee.findOne({ employeeId });
    
    if (!employee || !employee.isActive) {
      return NextResponse.json(
        { message: 'Invalid employee ID or PIN' },
        { status: 401 }
      );
    }

    const isValidPin = await bcrypt.compare(pin, employee.pin);
    
    if (!isValidPin) {
      return NextResponse.json(
        { message: 'Invalid employee ID or PIN' },
        { status: 401 }
      );
    }

    // End any existing active sessions for this employee
    await ActiveSession.updateMany(
      { employeeId, isActive: true },
      { 
        isActive: false,
        endTime: new Date()
      }
    );

    // Create new session
    const session = await ActiveSession.create({
      employeeId: employee.employeeId,
      startTime: new Date(),
      isActive: true
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { message: 'An error occurred during check-in' },
      { status: 500 }
    );
  }
} 