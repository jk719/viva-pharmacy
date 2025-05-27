/**
 * Centralized logging utility
 * Provides environment-aware logging with different levels
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Current log level based on environment
const currentLogLevel = isProduction ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  return [prefix, message, ...args];
};

/**
 * Logger object with different log levels
 */
export const logger = {
  /**
   * Debug level - only logs in development
   */
  debug: (message, ...args) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.log(...formatMessage('DEBUG', message, ...args));
    }
  },

  /**
   * Info level - logs in development
   */
  info: (message, ...args) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.info(...formatMessage('INFO', message, ...args));
    }
  },

  /**
   * Warning level - logs in all environments
   */
  warn: (message, ...args) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn(...formatMessage('WARN', message, ...args));
    }
  },

  /**
   * Error level - always logs
   */
  error: (message, ...args) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error(...formatMessage('ERROR', message, ...args));
    }
  },

  /**
   * Group related logs together
   */
  group: (label, fn) => {
    if (isDevelopment) {
      console.group(label);
      fn();
      console.groupEnd();
    } else {
      fn();
    }
  },

  /**
   * Time a function execution
   */
  time: async (label, fn) => {
    if (isDevelopment) {
      console.time(label);
      const result = await fn();
      console.timeEnd(label);
      return result;
    }
    return await fn();
  },

  /**
   * Log API requests
   */
  api: {
    request: (method, url, data) => {
      logger.debug(`API Request: ${method} ${url}`, data);
    },
    response: (method, url, status, data) => {
      logger.debug(`API Response: ${method} ${url} - ${status}`, data);
    },
    error: (method, url, error) => {
      logger.error(`API Error: ${method} ${url}`, error);
    }
  },

  /**
   * Log loyalty system events
   */
  loyalty: {
    event: (event, data) => {
      logger.info(`Loyalty Event: ${event}`, data);
    },
    calculation: (calculation, result) => {
      logger.debug(`Loyalty Calculation: ${calculation}`, result);
    },
    error: (operation, error) => {
      logger.error(`Loyalty Error in ${operation}:`, error);
    }
  }
};

// Export convenience methods
export const { debug, info, warn, error } = logger;

export default logger; 