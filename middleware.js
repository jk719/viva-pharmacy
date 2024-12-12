// src/middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow webhook requests to bypass auth
    if (req.nextUrl.pathname === '/api/webhook') {
      return NextResponse.next();
    }

    // Check for internal API calls
    const authHeader = req.headers.get('authorization');
    const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'stripe-webhook-key';
    if (authHeader === `Bearer ${INTERNAL_KEY}`) {
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow webhook requests
        if (req.nextUrl.pathname === '/api/webhook') {
          return true;
        }
        
        // Allow internal API calls
        const authHeader = req.headers.get('authorization');
        const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'stripe-webhook-key';
        if (authHeader === `Bearer ${INTERNAL_KEY}`) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/profile/:path*",
    "/api/user/:path*",
    "/api/webhook",  // Add webhook route to matcher
  ],
};