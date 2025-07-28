import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Remove isValidPayment function as the cookies are no longer set
/*
const isValidPayment = (cookies) => {
  const paymentIntentId = cookies.get('paymentIntentId')?.value;
  const paymentTimestamp = cookies.get('paymentTimestamp')?.value;
  
  if (!paymentIntentId || !paymentTimestamp) return false;
  
  // Check if payment was made in the last 30 minutes
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
  return parseInt(paymentTimestamp) > thirtyMinutesAgo;
};
*/

const secret = process.env.NEXTAUTH_SECRET;

// Remove the withAuth wrapper
export async function middleware(req) {
  // Get token directly
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  console.log(`Middleware processing ${pathname}. Token found:`, !!token);
  if (token) {
    console.log('Middleware found token:', JSON.stringify(token, null, 2));
  }

  // --- AUTHENTICATION & BASIC ACCESS --- 

  // Allow specific public routes unconditionally
  const publicPaths = [
    '/verify-email',
    '/reset-password',
    '/forgot-password',
    '/api/auth', // Allow all next-auth routes
    '/api/webhook', // Allow webhook
    // Add other necessary public paths like '/login', '/' (if homepage is public)
    '/login', // Assuming /login is the actual login page path now
    '/', 
  ];

  // Allow public assets and _next resources
  if (pathname.startsWith('/_next') || pathname.startsWith('/public') || pathname.includes('/favicon.ico')) {
    return NextResponse.next();
  }

  // Allow public GET requests for products
  if (pathname.startsWith('/api/products') && req.method === 'GET') {
      return NextResponse.next();
  }

  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If no token exists for any other route, redirect to login
  if (!token) {
    console.warn(`Middleware: No token found for protected route ${pathname}. Redirecting.`);
    const loginUrl = new URL('/', req.url); // Redirect to homepage
    loginUrl.searchParams.set('showLogin', 'true');
    loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }

  // --- ROLE-BASED AUTHORIZATION (Now that we know a token exists) ---

  // Admin routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!['ADMIN', 'MANAGER'].includes(token.role)) {
      console.warn(`Middleware: User ${token.email} with role ${token.role} denied access to ${pathname}`);
      return NextResponse.redirect(new URL('/', req.url)); // Redirect to home
    }

    if (token.role === 'MANAGER') {
      const allowedManagerPaths = [
        '/admin/products',
        // Add other allowed paths like '/admin/products/add', '/admin/products/edit/*' etc.
      ];
       // Basic check: Allow if path starts with any allowed path
      if (!allowedManagerPaths.some(p => pathname.startsWith(p)) && pathname !== '/admin') {
         console.warn(`Middleware: Manager ${token.email} denied access to ${pathname}. Redirecting to /admin/products`);
         return NextResponse.redirect(new URL('/admin/products', req.url));
      }
    }
    // Admins and authorized managers can proceed
    console.log(`Middleware: Authorized access for ${token.role} to ${pathname}`);
    return NextResponse.next(); 
  }

  // Pharmacy Check-in Route
  if (pathname.startsWith('/pharmacy-check-in')) {
    if (!token.isPharmacyAccount) {
      console.warn(`Middleware: User ${token.email} denied access to ${pathname} (not a pharmacy account)`);
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Protected API Routes (POST/PUT/DELETE /api/products, /api/user/*)
  const isProtectedApiMethod = pathname.startsWith('/api/products') && !['GET'].includes(req.method);
  const isUserApi = pathname.startsWith('/api/user');
  // Note: Prescription APIs are currently disabled (Coming Soon)

  if (isProtectedApiMethod || isUserApi) {
      // All these require at least a logged-in user (token check already passed)
      
      // Product modifications require ADMIN/MANAGER
      if (isProtectedApiMethod && !['ADMIN', 'MANAGER'].includes(token.role)) {
          console.warn(`Middleware: User ${token.email} role ${token.role} denied ${req.method} on ${pathname}`);
          return new NextResponse(JSON.stringify({ message: "Forbidden" }), { status: 403 });
      }
      
      // Manager restrictions for product APIs
      if (isProtectedApiMethod && token.role === 'MANAGER' && !pathname.startsWith('/api/products')) {
           console.warn(`Middleware: Manager ${token.email} denied access to non-product API ${pathname}`);
           return new NextResponse(JSON.stringify({ message: "Forbidden" }), { status: 403 });
      }
      
      // If all checks pass for protected APIs, let it through
      console.log(`Middleware: Authorized API access for ${token.role} to ${pathname}`);
      return NextResponse.next();
  }

  // Allow all other authenticated requests (e.g., /profile, /checkout, /rx, /prescriptions)
  console.log(`Middleware: Allowing authenticated access for ${token.role} to ${pathname}`);
  return NextResponse.next();
}

// Keep the matcher config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * Match all paths not starting with these exclusions
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)', 
    // Explicitly include paths that might otherwise be missed if needed, 
    // but the above negative lookahead should cover most cases.
    // Ensure your API paths and page routes are covered.
  ],
};