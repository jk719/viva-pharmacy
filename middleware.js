// src/middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Remove direct import of paymentTracker
// Instead, use a simpler cookie-based check for payment state
const isValidPayment = (cookies) => {
  const paymentIntentId = cookies.get('paymentIntentId')?.value;
  const paymentTimestamp = cookies.get('paymentTimestamp')?.value;
  
  if (!paymentIntentId || !paymentTimestamp) return false;
  
  // Check if payment was made in the last 30 minutes
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
  return parseInt(paymentTimestamp) > thirtyMinutesAgo;
};

export default withAuth(
  function middleware(req) {
    // Check payment state for success page
    if (req.nextUrl.pathname === '/checkout/success') {
      if (!isValidPayment(req.cookies)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Handle all protected routes that require authentication
    if (!req.nextauth?.token) {
      const protectedRoutes = ['/checkout', '/profile', '/cart', '/admin'];
      if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
        return NextResponse.redirect(
          new URL(
            `/?showLogin=true&callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`,
            req.url
          )
        );
      }
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
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ message: "Unauthorized" }), 
          { status: 403 }
        );
      }
      // Redirect non-API routes to home with login modal
      return NextResponse.redirect(
        new URL(
          `/?showLogin=true&message=${encodeURIComponent('Please login as admin to access this page')}`,
          req.url
        )
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
    '/profile/:path*',
    '/api/user/:path*',
    '/api/webhook',
    '/admin/:path*',
    '/api/products/:path*',
    '/checkout/:path*',
    '/cart/:path*'
  ],
};