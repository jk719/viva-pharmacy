import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { handleError } from '@/lib/errors';

/**
 * Centralized API helpers for database operations and error handling
 * Eliminates duplicate patterns across API routes
 */

/**
 * Standard API response wrapper
 * @param {Function} handler - The API operation function
 * @param {Object} options - Configuration options
 * @returns {Function} Wrapped handler
 */
export function withApiHandler(handler, options = {}) {
  const {
    requireDb = true,
    errorHandler = defaultErrorHandler,
    successStatus = 200
  } = options;

  return async function(request, context) {
    try {
      // Connect to database if required
      if (requireDb) {
        await dbConnect();
      }

      // Execute the handler
      const result = await handler(request, context);

      // Handle different result types
      if (result instanceof NextResponse) {
        return result;
      }

      // Wrap successful results
      return createSuccessResponse(result, successStatus);

    } catch (error) {
      console.error('API Handler Error:', error);
      return errorHandler(error, request);
    }
  };
}

/**
 * Database operation wrapper with error handling
 * @param {Function} operation - Database operation function
 * @param {Object} options - Configuration options
 * @returns {Promise} Operation result
 */
export async function withDbOperation(operation, options = {}) {
  const {
    connectFirst = true,
    errorMessage = 'Database operation failed'
  } = options;

  try {
    if (connectFirst) {
      await dbConnect();
    }

    const result = await operation();
    return result;

  } catch (error) {
    console.error('Database Operation Error:', error);
    
    // Handle specific database errors
    if (error.name === 'ValidationError') {
      throw new Error(`Validation failed: ${Object.values(error.errors).map(e => e.message).join(', ')}`);
    }
    
    if (error.name === 'MongoError' && error.code === 11000) {
      throw new Error('Duplicate entry found');
    }
    
    if (error.name === 'CastError') {
      throw new Error('Invalid ID format');
    }

    throw new Error(errorMessage);
  }
}

/**
 * Standardized success response creator
 * @param {*} data - Response data
 * @param {number} status - HTTP status code
 * @param {string} message - Success message
 * @returns {NextResponse} Formatted response
 */
export function createSuccessResponse(data, status = 200, message = null) {
  const response = {
    success: true,
    timestamp: new Date().toISOString()
  };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  return NextResponse.json(response, { status });
}

/**
 * Standardized error response creator
 * @param {string|Error} error - Error message or Error object
 * @param {number} status - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {NextResponse} Formatted error response
 */
export function createErrorResponse(error, status = 500, details = null) {
  const message = error instanceof Error ? error.message : error;
  
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.details = details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    response.stack = error.stack;
  }

  return NextResponse.json(response, { status });
}

/**
 * Default error handler
 * @param {Error} error - The error object
 * @param {Request} request - The request object
 * @returns {NextResponse} Error response
 */
export function defaultErrorHandler(error, request = null) {
  // Log error details
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: request?.url,
    method: request?.method
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return createErrorResponse(error.message, 400);
  }

  if (error.name === 'UnauthorizedError') {
    return createErrorResponse('Unauthorized access', 401);
  }

  if (error.name === 'ForbiddenError') {
    return createErrorResponse('Forbidden', 403);
  }

  if (error.name === 'NotFoundError') {
    return createErrorResponse('Resource not found', 404);
  }

  if (error.name === 'ConflictError') {
    return createErrorResponse(error.message, 409);
  }

  // Default server error
  return createErrorResponse(
    process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    500
  );
}

/**
 * Validation helper for request data
 * @param {Object} data - Data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
export function validateRequestData(data, schema) {
  const errors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Required field check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip further validation if field is not required and empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    if (rules.type && typeof value !== rules.type) {
      errors[field] = `${field} must be of type ${rules.type}`;
      continue;
    }

    // String length validation
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`;
      continue;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} must be no more than ${rules.maxLength} characters`;
      continue;
    }

    // Number range validation
    if (rules.min && value < rules.min) {
      errors[field] = `${field} must be at least ${rules.min}`;
      continue;
    }

    if (rules.max && value > rules.max) {
      errors[field] = `${field} must be no more than ${rules.max}`;
      continue;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.patternMessage || `${field} format is invalid`;
      continue;
    }

    // Custom validation
    if (rules.validate && typeof rules.validate === 'function') {
      const customError = rules.validate(value);
      if (customError) {
        errors[field] = customError;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Pagination helper
 * @param {Object} query - Query parameters
 * @param {Object} options - Pagination options
 * @returns {Object} Pagination configuration
 */
export function getPaginationConfig(query, options = {}) {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    defaultPage = 1
  } = options;

  const page = Math.max(1, parseInt(query.page) || defaultPage);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    offset: skip
  };
}

/**
 * Search and filter helper
 * @param {Object} query - Query parameters
 * @param {Array} searchFields - Fields to search in
 * @returns {Object} MongoDB query object
 */
export function buildSearchQuery(query, searchFields = []) {
  const mongoQuery = {};

  // Text search
  if (query.search && searchFields.length > 0) {
    mongoQuery.$or = searchFields.map(field => ({
      [field]: { $regex: query.search, $options: 'i' }
    }));
  }

  // Date range filters
  if (query.startDate || query.endDate) {
    mongoQuery.createdAt = {};
    if (query.startDate) {
      mongoQuery.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      mongoQuery.createdAt.$lte = new Date(query.endDate);
    }
  }

  // Status filter
  if (query.status) {
    mongoQuery.status = query.status;
  }

  return mongoQuery;
}

/**
 * Response metadata helper
 * @param {Array} data - Response data
 * @param {Object} pagination - Pagination config
 * @param {number} total - Total count
 * @returns {Object} Response with metadata
 */
export function createPaginatedResponse(data, pagination, total) {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * Rate limiting helper
 * @param {Request} request - The request object
 * @param {Object} options - Rate limiting options
 * @returns {Object} Rate limit result
 */
export function checkRateLimit(request, options = {}) {
  // This is a placeholder - implement with Redis or in-memory store
  // For now, return success
  return {
    success: true,
    remaining: 100,
    resetTime: Date.now() + 60000
  };
}

/**
 * Common API route patterns
 */

// GET with pagination and search
export const createGetHandler = (Model, options = {}) => {
  const {
    searchFields = ['name'],
    populate = '',
    select = '',
    defaultSort = { createdAt: -1 }
  } = options;

  return withApiHandler(async (request) => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams);

    const pagination = getPaginationConfig(query);
    const searchQuery = buildSearchQuery(query, searchFields);

    const [data, total] = await Promise.all([
      Model.find(searchQuery)
        .populate(populate)
        .select(select)
        .sort(defaultSort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Model.countDocuments(searchQuery)
    ]);

    return createPaginatedResponse(data, pagination, total);
  });
};

// POST with validation
export const createPostHandler = (Model, validationSchema) => {
  return withApiHandler(async (request) => {
    const data = await request.json();
    
    const validation = validateRequestData(data, validationSchema);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const document = new Model(data);
    await document.save();

    return {
      message: 'Created successfully',
      data: document
    };
  }, { successStatus: 201 });
};

// PUT with validation
export const createPutHandler = (Model, validationSchema) => {
  return withApiHandler(async (request, context) => {
    const { id } = context.params;
    const data = await request.json();
    
    const validation = validateRequestData(data, validationSchema);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const document = await Model.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!document) {
      throw new Error('Document not found');
    }

    return {
      message: 'Updated successfully',
      data: document
    };
  });
};

// DELETE handler
export const createDeleteHandler = (Model) => {
  return withApiHandler(async (request, context) => {
    const { id } = context.params;

    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      throw new Error('Document not found');
    }

    return {
      message: 'Deleted successfully',
      data: { id }
    };
  });
};

export default {
  withApiHandler,
  withDbOperation,
  createSuccessResponse,
  createErrorResponse,
  defaultErrorHandler,
  validateRequestData,
  getPaginationConfig,
  buildSearchQuery,
  createPaginatedResponse,
  checkRateLimit,
  createGetHandler,
  createPostHandler,
  createPutHandler,
  createDeleteHandler
}; 