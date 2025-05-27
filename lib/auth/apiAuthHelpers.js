import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Centralized API authentication helpers
 * Eliminates duplicate auth patterns across API routes
 */

const secret = process.env.NEXTAUTH_SECRET;

/**
 * Role hierarchy for authorization
 */
const ROLE_HIERARCHY = {
  ADMIN: ['ADMIN'],
  MANAGER: ['ADMIN', 'MANAGER'],
  USER: ['ADMIN', 'MANAGER', 'USER']
};

/**
 * Extract and validate authentication token from request
 * @param {Request} request - The incoming request
 * @returns {Object|null} Token object or null if invalid
 */
export async function getAuthToken(request) {
  try {
    // First try to get token from middleware (preferred)
    if (request.nextauth?.token) {
      return request.nextauth.token;
    }

    // Fallback to direct token extraction
    const token = await getToken({ req: request, secret });
    return token;
  } catch (error) {
    console.error('Error extracting auth token:', error);
    return null;
  }
}

/**
 * Check if user has required role
 * @param {string} userRole - User's current role
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean} Whether user has required role
 */
export function hasRequiredRole(userRole, requiredRoles) {
  if (!userRole) return false;
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.some(role => ROLE_HIERARCHY[role]?.includes(userRole));
}

/**
 * Middleware function to check authentication
 * @param {Request} request - The incoming request
 * @param {Object} options - Authentication options
 * @param {string|string[]} options.roles - Required roles
 * @param {boolean} options.allowSelf - Allow user to access their own data
 * @param {string} options.userIdParam - Parameter name for user ID (for self-access)
 * @returns {Object} Authentication result
 */
export async function checkAuth(request, options = {}) {
  const { 
    roles = ['USER'], 
    allowSelf = false, 
    userIdParam = 'userId' 
  } = options;

  try {
    // Get authentication token
    const token = await getAuthToken(request);
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401,
        response: NextResponse.json(
          { error: 'Authentication required' }, 
          { status: 401 }
        )
      };
    }

    // Check if user has required role
    const hasRole = hasRequiredRole(token.role, roles);
    
    // If user doesn't have role, check if self-access is allowed
    if (!hasRole && allowSelf) {
      const url = new URL(request.url);
      const requestedUserId = url.searchParams.get(userIdParam) || 
                             url.pathname.split('/').pop();
      
      if (requestedUserId === token.id || requestedUserId === token.sub) {
        return {
          success: true,
          token,
          isSelfAccess: true
        };
      }
    }

    // Final role check
    if (!hasRole) {
      return {
        success: false,
        error: 'Insufficient permissions',
        status: 403,
        response: NextResponse.json(
          { error: 'Insufficient permissions' }, 
          { status: 403 }
        )
      };
    }

    return {
      success: true,
      token,
      isSelfAccess: false
    };

  } catch (error) {
    console.error('Authentication check error:', error);
    return {
      success: false,
      error: 'Authentication error',
      status: 500,
      response: NextResponse.json(
        { error: 'Authentication error' }, 
        { status: 500 }
      )
    };
  }
}

/**
 * Higher-order function to wrap API routes with authentication
 * @param {Function} handler - The API route handler
 * @param {Object} authOptions - Authentication options
 * @returns {Function} Wrapped handler function
 */
export function withAuth(handler, authOptions = {}) {
  return async function(request, context) {
    const authResult = await checkAuth(request, authOptions);
    
    if (!authResult.success) {
      return authResult.response;
    }

    // Add auth info to request for handler use
    request.auth = {
      token: authResult.token,
      user: {
        id: authResult.token.id || authResult.token.sub,
        email: authResult.token.email,
        role: authResult.token.role
      },
      isSelfAccess: authResult.isSelfAccess
    };

    // Call the original handler
    return handler(request, context);
  };
}

/**
 * Specific auth helpers for common patterns
 */

/**
 * Admin-only authentication
 */
export async function requireAdmin(request) {
  return checkAuth(request, { roles: ['ADMIN'] });
}

/**
 * Admin or Manager authentication
 */
export async function requireAdminOrManager(request) {
  return checkAuth(request, { roles: ['ADMIN', 'MANAGER'] });
}

/**
 * User authentication with self-access
 */
export async function requireUserOrSelf(request, userIdParam = 'userId') {
  return checkAuth(request, { 
    roles: ['USER'], 
    allowSelf: true, 
    userIdParam 
  });
}

/**
 * Any authenticated user
 */
export async function requireAuth(request) {
  return checkAuth(request, { roles: ['USER'] });
}

/**
 * Utility function to create standardized error responses
 */
export function createAuthErrorResponse(message, status = 401) {
  return NextResponse.json(
    { 
      error: message,
      timestamp: new Date().toISOString()
    }, 
    { status }
  );
}

/**
 * Utility function to create standardized success responses
 */
export function createSuccessResponse(data, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

/**
 * Middleware wrapper for easy integration
 * Usage: export const GET = withAuthMiddleware(handler, { roles: ['ADMIN'] });
 */
export function withAuthMiddleware(handler, authOptions = {}) {
  return withAuth(handler, authOptions);
}

/**
 * Extract user ID from various sources (params, query, body)
 */
export function extractUserId(request, context = {}) {
  // Try context params first (dynamic routes)
  if (context.params?.userId) {
    return context.params.userId;
  }
  
  // Try URL params
  const url = new URL(request.url);
  const userIdFromQuery = url.searchParams.get('userId');
  if (userIdFromQuery) {
    return userIdFromQuery;
  }
  
  // Try extracting from pathname
  const pathSegments = url.pathname.split('/');
  const userIndex = pathSegments.findIndex(segment => segment === 'user');
  if (userIndex !== -1 && pathSegments[userIndex + 1]) {
    return pathSegments[userIndex + 1];
  }
  
  return null;
}

/**
 * Validate that user can only access their own data
 */
export function validateSelfAccess(token, targetUserId) {
  const userId = token.id || token.sub;
  return userId === targetUserId;
}

export default {
  getAuthToken,
  hasRequiredRole,
  checkAuth,
  withAuth,
  requireAdmin,
  requireAdminOrManager,
  requireUserOrSelf,
  requireAuth,
  createAuthErrorResponse,
  createSuccessResponse,
  withAuthMiddleware,
  extractUserId,
  validateSelfAccess
}; 