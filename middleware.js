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
    const token = req.nextauth?.token;
    
    // Add this near the start, after token declaration
    if (req.nextUrl.pathname === '/login') {
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl');
      const redirectUrl = new URL('/', req.url);
      redirectUrl.searchParams.set('showLogin', 'true');
      if (callbackUrl) {
        redirectUrl.searchParams.set('callbackUrl', callbackUrl);
      }
      return NextResponse.redirect(redirectUrl);
    }

    // Handle admin routes first
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(
          new URL(
            `/?showLogin=true&callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`,
            req.url
          )
        );
      }

      // Check role for admin access
      if (!['ADMIN', 'MANAGER'].includes(token.role)) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Update this section for manager redirects
      if (token.role === 'MANAGER') {
        // If manager is accessing root admin page, redirect to products page
        if (req.nextUrl.pathname === '/admin') {
          return NextResponse.redirect(new URL('/admin/products', req.url));
        }

        const allowedManagerPaths = [
          '/admin/products',
          '/admin/products/add',
          '/admin/products/edit'
        ];
        
        // Only redirect if not on an allowed path
        if (!allowedManagerPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
          return NextResponse.redirect(new URL('/admin/products', req.url));
        }
      }

      // Add this to the middleware function after the admin routes check
      if (req.nextUrl.pathname.startsWith('/pharmacy-check-in')) {
        if (!token?.isPharmacyAccount) {
          return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.next();
      }

      return NextResponse.next();
    }

    // Add reset-password to public routes
    const publicRoutes = [
      '/verify-email',
      '/reset-password',
      '/forgot-password'
    ];
    
    if (publicRoutes.includes(req.nextUrl.pathname)) {
      return NextResponse.next();
    }

    // Check payment state for success page
    if (req.nextUrl.pathname === '/checkout/success') {
      if (!isValidPayment(req.cookies)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Handle all protected routes that require authentication
    if (!req.nextauth?.token) {
      const protectedRoutes = ['/checkout', '/profile', '/admin', '/prescriptions', '/rx'];
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
    if (req.nextUrl.pathname.includes('/api/user/events')) {
      req.timeoutMs = 0;
      return NextResponse.next();
    }

    const isPublicRoute = 
      (req.nextUrl.pathname.startsWith('/api/products') && req.method === 'GET') ||
      req.nextUrl.pathname === '/api/webhook';

    if (isPublicRoute) {
      return NextResponse.next();
    }

    const isProtectedApiRoute = 
      req.nextUrl.pathname.startsWith('/api/products') && 
      ['POST', 'PUT', 'DELETE'].includes(req.method);

    if (isProtectedApiRoute) {
      // Check if user is authenticated and has proper role
      if (!token?.role || !['ADMIN', 'MANAGER'].includes(token.role)) {
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return new NextResponse(
            JSON.stringify({ message: "Unauthorized" }), 
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Additional check for manager restrictions
      if (token.role === 'MANAGER') {
        // Only allow access to products-related routes
        const allowedManagerPaths = [
          '/admin/products',
          '/api/products',
          '/api/products/'  // Include base products API path
        ];
        
        if (!allowedManagerPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
          if (req.nextUrl.pathname.startsWith('/api/')) {
            return new NextResponse(
              JSON.stringify({ message: "Access denied" }), 
              { status: 403 }
            );
          }
          return NextResponse.redirect(new URL('/admin/products', req.url));
        }
      }
    }

    // Add prescription routes handling
    if (req.nextUrl.pathname.startsWith('/rx') || req.nextUrl.pathname.startsWith('/prescriptions')) {
      // Require authentication for all prescription routes
      if (!token) {
        return NextResponse.redirect(
          new URL(
            `/?showLogin=true&callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`,
            req.url
          )
        );
      }

      // Special handling for admin prescription verification routes
      if (req.nextUrl.pathname.startsWith('/admin/prescriptions')) {
        if (!['ADMIN', 'PHARMACIST'].includes(token.role)) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
    }

    // Add prescription API route protection
    const isPrescriptionApiRoute = req.nextUrl.pathname.startsWith('/api/prescriptions');
    if (isPrescriptionApiRoute) {
      if (!token) {
        return new NextResponse(
          JSON.stringify({ message: "Unauthorized" }), 
          { status: 401 }
        );
      }

      // Verify/process prescriptions requires special roles
      if (req.nextUrl.pathname.includes('/verify') || req.nextUrl.pathname.includes('/process')) {
        if (!['ADMIN', 'PHARMACIST'].includes(token.role)) {
          return new NextResponse(
            JSON.stringify({ message: "Access denied" }), 
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Admin routes authorization
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token && ['ADMIN', 'MANAGER'].includes(token.role);
        }

        // Add reset-password to public paths
        if (req.nextUrl.pathname === '/reset-password' ||
            req.nextUrl.pathname === '/verify-email' ||
            req.nextUrl.pathname === '/forgot-password') {
          return true;
        }

        // Allow SSE connections with valid session
        if (req.nextUrl.pathname.includes('/api/user/events')) {
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
            req.nextUrl.pathname.startsWith('/checkout')) {
          return !!token;
        }

        // Add prescription routes to protected paths
        if (req.nextUrl.pathname.startsWith('/rx') || 
            req.nextUrl.pathname.startsWith('/prescriptions') ||
            req.nextUrl.pathname.startsWith('/api/prescriptions')) {
          return !!token;
        }

        // Add admin prescription routes to admin-only paths
        if (req.nextUrl.pathname.startsWith('/admin/prescriptions')) {
          return !!token && ['ADMIN', 'PHARMACIST'].includes(token.role);
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
    '/reset-password/:path*',
    '/api/user/events',
    '/rx/:path*',
    '/prescriptions/:path*',
    '/api/prescriptions/:path*',
    '/admin/prescriptions/:path*',
    '/pharmacy-check-in/:path*',
  ],
};