import { NextResponse } from 'next/server';

// Prescription functionality disabled - Coming Soon
export async function GET(req, { params }) {
  return NextResponse.json({
    success: false,
    message: 'Prescription services are currently under development and will be available soon!',
    comingSoon: true
  }, { status: 503 }); // Service Unavailable
}

export async function PUT(req, { params }) {
  return NextResponse.json({
    success: false,
    message: 'Prescription services are currently under development and will be available soon!',
    comingSoon: true
  }, { status: 503 }); // Service Unavailable
}