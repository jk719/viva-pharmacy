import * as Sentry from '@sentry/nextjs';
import { createLogger, format, transports } from 'winston';

// Custom error classes
export class PrescriptionError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'PrescriptionError';
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

// Create Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Error handling middleware
export async function handleError(error, req = null) {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    details: error.details,
    request: req ? {
      url: req.url,
      method: req.method,
      headers: req.headers
    } : null
  };

  // Log error
  logger.error('Error occurred:', errorDetails);

  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: errorDetails
    });
  }

  // Return appropriate error response
  if (error instanceof ValidationError) {
    return {
      success: false,
      message: error.message,
      fields: error.fields,
      status: 400
    };
  }

  if (error instanceof PrescriptionError) {
    return {
      success: false,
      message: error.message,
      code: error.code,
      details: error.details,
      status: 400
    };
  }

  // Default error response
  return {
    success: false,
    message: 'An unexpected error occurred',
    status: 500
  };
} 