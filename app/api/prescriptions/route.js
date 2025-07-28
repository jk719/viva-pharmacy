import { NextResponse } from 'next/server';

// Prescription functionality disabled - Coming Soon
export async function POST(req) {
  return NextResponse.json({
    success: false,
    message: 'Prescription services are currently under development and will be available soon!',
    comingSoon: true
  }, { status: 503 }); // Service Unavailable
}

export async function GET(req) {
  return NextResponse.json({
    success: false,
    message: 'Prescription services are currently under development and will be available soon!',
    comingSoon: true,
    prescriptions: []
  }, { status: 503 }); // Service Unavailable
}