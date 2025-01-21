// src/middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { paymentTracker } from '@/lib/stripe/paymentTracker';

export default withAuth(
  function middleware(req) {
    // Check payment state for success page
    if (req.nextUrl.pathname === '/checkout/success') {
      const paymentIntentId = req.cookies.get('paymentIntentId')?.value;
      if (!paymentIntentId || !paymentTracker.isProcessing(paymentIntentId)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Add checkout protection
    if (req.nextUrl.pathname.startsWith('/checkout') && !req.nextauth?.token) {
      return NextResponse.redirect(
        new URL('/login?callbackUrl=' + encodeURIComponent(req.url), req.url)
      );
    }

    // Special handling for SSE connections
    if (req.nextUrl.pathname.includes('/api/user/vivabucks') && 
        req.nextUrl.pathname.endsWith('/events')) {
      req.timeoutMs = 0;
      return NextResponse.next();
    }

    const isPublicRoute = 
      (req.nextUrl.pathname.startsWith('/api/products') && req.method === 'GET') ||
      req.nextUrl.pathname === '/api/webhook';

    if (isPublicRoute) {
      return NextResponse.next();
    }

    const token = req.nextauth?.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isProtectedApiRoute = 
      req.nextUrl.pathname.startsWith('/api/products') && 
      ['POST', 'PUT', 'DELETE'].includes(req.method);

    if ((isAdminRoute || isProtectedApiRoute) && 
        (!token?.role || !['ADMIN', 'MANAGER'].includes(token.role))) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }), 
        { status: 403 }
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow SSE connections with valid session
        if (req.nextUrl.pathname.includes('/api/user/vivabucks') && 
            req.nextUrl.pathname.endsWith('/events')) {
          return !!token;
        }

        // Public routes
        if (req.nextUrl.pathname.startsWith('/api/products') && req.method === 'GET') {
          return true;
        }
        if (req.nextUrl.pathname === '/api/webhook') {
          return true;
        }

        // Protected routes
        if (req.nextUrl.pathname.startsWith('/profile') ||
            req.nextUrl.pathname.startsWith('/admin') ||
            req.nextUrl.pathname.startsWith('/api/user') ||
            req.nextUrl.pathname.startsWith('/checkout') ||
            req.nextUrl.pathname.startsWith('/cart')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/profile/:path*',
    '/api/user/:path*',
    '/api/webhook',
    '/admin/:path*',
    '/api/products/:path*',
    '/checkout/:path*',
    '/cart/:path*'  // Added cart to protected routes
  ],
};