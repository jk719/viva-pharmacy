/**
 * Enhanced logger utility that persists logs across page navigations
 */

const MAX_LOGS = 1000;

// Create persistent log storage
export const setupLogger = () => {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Create a logger that saves to sessionStorage
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  // Get existing logs
  const getLogs = () => {
    try {
      return JSON.parse(sessionStorage.getItem('viva_debug_logs') || '[]');
    } catch (e) {
      return [];
    }
  };

  // Save logs
  const saveLogs = (logs) => {
    try {
      // Keep only the last MAX_LOGS
      const trimmedLogs = logs.slice(-MAX_LOGS);
      sessionStorage.setItem('viva_debug_logs', JSON.stringify(trimmedLogs));
    } catch (e) {
      // Ignore storage errors
    }
  };

  // Add a log entry
  const addLog = (type, ...args) => {
    const logs = getLogs();
    logs.push({
      type,
      timestamp: new Date().toISOString(),
      message: args.map(arg => {
        try {
          return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
        } catch (e) {
          return '[Object]';
        }
      }).join(' ')
    });
    saveLogs(logs);
  };

  // Override console methods
  console.log = (...args) => {
    addLog('log', ...args);
    originalConsoleLog.apply(console, args);
  };

  console.warn = (...args) => {
    addLog('warn', ...args);
    originalConsoleWarn.apply(console, args);
  };

  console.error = (...args) => {
    addLog('error', ...args);
    originalConsoleError.apply(console, args);
  };

  // Add method to view logs
  window.viewLogs = () => {
    const logs = getLogs();
    console.clear();
    originalConsoleLog.call(console, '===== PERSISTED LOGS =====');
    logs.forEach(log => {
      const method = log.type === 'error' ? originalConsoleError : 
                    log.type === 'warn' ? originalConsoleWarn : 
                    originalConsoleLog;
      method.call(console, `[${log.timestamp}] ${log.message}`);
    });
    originalConsoleLog.call(console, '=========================');
    return logs.length;
  };

  // Clear logs
  window.clearLogs = () => {
    sessionStorage.removeItem('viva_debug_logs');
    console.clear();
    originalConsoleLog.call(console, 'Logs cleared');
  };

  // Log setup complete
  originalConsoleLog.call(console, '📝 Enhanced logger initialized - use window.viewLogs() to see persisted logs');
};

export default setupLogger;
