// src/middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
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

    // Check admin access
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
            req.nextUrl.pathname.startsWith('/api/user')) {
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
    '/checkout/:path*'
  ],
};