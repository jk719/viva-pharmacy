// src/middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow public GET requests to products API
    if (req.nextUrl.pathname.startsWith('/api/products') && req.method === 'GET') {
      return NextResponse.next();
    }

    // Allow webhook requests
    if (req.nextUrl.pathname === '/api/webhook') {
      return NextResponse.next();
    }

    // Check for internal API calls
    const authHeader = req.headers.get('authorization');
    const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'stripe-webhook-key';
    if (authHeader === `Bearer ${INTERNAL_KEY}`) {
      return NextResponse.next();
    }

    // Check for admin routes and protected API operations
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isProtectedApiRoute = req.nextUrl.pathname.startsWith('/api/products') && 
      ['POST', 'PUT', 'DELETE'].includes(req.method);

    if ((isAdminRoute || isProtectedApiRoute) && 
        (!req.nextauth?.token?.role || !['ADMIN', 'MANAGER'].includes(req.nextauth.token.role))) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public GET requests to products API
        if (req.nextUrl.pathname.startsWith('/api/products') && req.method === 'GET') {
          return true;
        }

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

        // Require authentication for admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token && ['ADMIN', 'MANAGER'].includes(token.role);
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
    "/api/webhook",
    "/admin/:path*",
    "/api/products/:path*"
  ],
};