// src/middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log('Middleware executing for:', req.nextUrl.pathname);
    console.log('Auth token:', req.nextauth.token);
    
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const token = req.nextauth.token;
      console.log('Admin check - Token:', token);
      console.log('Admin check - Role:', token?.role);
      
      if (!token?.role || token.role !== 'admin') {
        console.log('Access denied - redirecting');
        return NextResponse.redirect(new URL('/', req.url));
      }
      console.log('Admin access granted');
    }

    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Origin", 
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    );
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('Authorization callback - Token:', token);
        return !!token;
      }
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/protected/:path*",
    "/checkout/:path*",
  ]
};