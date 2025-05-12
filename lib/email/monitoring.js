/**
 * Email Monitoring System
 * 
 * This module provides monitoring and metrics collection for all email operations.
 * It can be integrated with external monitoring services or used standalone.
 */

// In-memory stats for email operations
let emailStats = {
  sent: 0,
  failed: 0,
  templates: {},
  // Track hourly activity for rate limiting monitoring
  hourlyActivity: Array(24).fill(0),
  // Simple daily log
  dailyLogs: [],
  lastErrors: []
};

// Constants
const MAX_LOG_SIZE = 1000;
const MAX_ERROR_COUNT = 50;

/**
 * Record a successful email send
 */
export function recordEmailSent(templateName, email, metadata = {}) {
  emailStats.sent++;
  
  // Track by template
  if (!emailStats.templates[templateName]) {
    emailStats.templates[templateName] = { sent: 0, failed: 0 };
  }
  emailStats.templates[templateName].sent++;
  
  // Update hourly stats
  const hour = new Date().getHours();
  emailStats.hourlyActivity[hour]++;
  
  // Add to daily log
  addToLog({
    type: 'sent',
    template: templateName,
    recipient: maskEmail(email),
    timestamp: new Date().toISOString(),
    metadata
  });
}

/**
 * Record a failed email send
 */
export function recordEmailFailed(templateName, email, error, metadata = {}) {
  emailStats.failed++;
  
  // Track by template
  if (!emailStats.templates[templateName]) {
    emailStats.templates[templateName] = { sent: 0, failed: 0 };
  }
  emailStats.templates[templateName].failed++;
  
  // Add to error log
  const errorDetails = {
    type: 'error',
    template: templateName,
    recipient: maskEmail(email),
    timestamp: new Date().toISOString(),
    error: error.message || String(error),
    metadata
  };
  
  // Add to last errors
  emailStats.lastErrors.unshift(errorDetails);
  if (emailStats.lastErrors.length > MAX_ERROR_COUNT) {
    emailStats.lastErrors.pop();
  }
  
  // Add to daily log
  addToLog(errorDetails);
}

/**
 * Get current email statistics
 */
export function getEmailStats() {
  return {
    ...emailStats,
    // Calculate success rate
    successRate: emailStats.sent > 0 
      ? ((emailStats.sent / (emailStats.sent + emailStats.failed)) * 100).toFixed(2) + '%' 
      : '0%',
    // Calculate hourly rate
    hourlyRate: (emailStats.hourlyActivity.reduce((a, b) => a + b, 0) / 24).toFixed(2)
  };
}

/**
 * Reset stats (can be called periodically)
 */
export function resetStats() {
  const oldStats = { ...emailStats };
  
  emailStats = {
    sent: 0,
    failed: 0,
    templates: {},
    hourlyActivity: Array(24).fill(0),
    dailyLogs: [],
    lastErrors: []
  };
  
  return oldStats;
}

/**
 * Add entry to the log, maintaining maximum size
 */
function addToLog(entry) {
  emailStats.dailyLogs.unshift(entry);
  if (emailStats.dailyLogs.length > MAX_LOG_SIZE) {
    emailStats.dailyLogs.pop();
  }
}

/**
 * Mask email for privacy in logs
 */
function maskEmail(email) {
  if (!email) return 'unknown';
  
  const [username, domain] = email.split('@');
  if (!domain) return 'invalid-email';
  
  const maskedUsername = username.length > 2
    ? `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}`
    : `${username[0]}${'*'.repeat(username.length - 1)}`;
    
  const domainParts = domain.split('.');
  const tld = domainParts.pop();
  const maskedDomain = `${domainParts.join('.')[0]}${'*'.repeat(domain.length - tld.length - 2)}.${tld}`;
  
  return `${maskedUsername}@${maskedDomain}`;
}

// Initialize monitoring system
console.log('📊 Email monitoring system initialized');

// Export singleton
export default {
  recordEmailSent,
  recordEmailFailed,
  getEmailStats,
  resetStats
}; 