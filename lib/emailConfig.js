let emailConfigLogged = false;

export function logEmailConfig(config) {
  if (!emailConfigLogged && process.env.NODE_ENV === 'development') {
    console.log('Email configuration initialized');
    emailConfigLogged = true;
  }
} 