/**
 * Unified Email Configuration
 * 
 * This module centralizes all email-related configuration
 * for use across the application.
 */

import { createDKIMKey } from 'nodemailer/lib/dkim';

// Environment variable fallbacks with sensible defaults
const getEnvVar = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

// Email service configuration with fallbacks
export const emailConfig = {
  // SMTP transport configuration
  smtp: {
    host: getEnvVar('EMAIL_HOST', 'smtp.gmail.com'),
    port: parseInt(getEnvVar('EMAIL_PORT', '587'), 10),
    secure: getEnvVar('EMAIL_SECURE', 'false') === 'true',
    auth: {
      user: getEnvVar('GMAIL_USER', getEnvVar('EMAIL_USER')),
      pass: getEnvVar('GMAIL_APP_PASSWORD', getEnvVar('EMAIL_PASSWORD'))
    }
  },
  
  // Email defaults
  defaults: {
    from: `"${getEnvVar('EMAIL_FROM_NAME', 'Viva Pharmacy')}" <${getEnvVar('GMAIL_USER', getEnvVar('EMAIL_FROM'))}>`,
    replyTo: getEnvVar('EMAIL_REPLY_TO', getEnvVar('GMAIL_USER', getEnvVar('EMAIL_FROM')))
  },
  
  // DKIM configuration for improved deliverability
  dkim: {
    enabled: getEnvVar('DKIM_ENABLED', 'false') === 'true',
    domainName: getEnvVar('DKIM_DOMAIN', 'vivapharmacy.com'),
    keySelector: getEnvVar('DKIM_SELECTOR', 'default'),
    privateKey: getEnvVar('DKIM_PRIVATE_KEY', ''),
    cacheDir: getEnvVar('DKIM_CACHE_DIR', '/tmp'),
    cacheTreshold: 100 * 1024
  },
  
  // SPF configuration
  spf: {
    enforce: true,
    policy: getEnvVar('SPF_POLICY', 'v=spf1 include:_spf.google.com ~all')
  },
  
  // Email rate limiting
  rateLimiting: {
    enabled: true,
    maxAttemptsPerHour: parseInt(getEnvVar('EMAIL_RATE_LIMIT_PER_HOUR', '5'), 10),
    cooldownPeriod: 60 * 60 * 1000 // 1 hour in milliseconds
  },
  
  // Base URL for links in emails
  baseUrl: getEnvVar('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000'),
  
  // Logo and branding
  branding: {
    logoUrl: `${getEnvVar('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')}/images/viva-online-logo.png`,
    logoAlt: 'Viva Pharmacy',
    storeName: 'Viva Pharmacy',
    storeAddress: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    contactPhone: getEnvVar('PHARMACY_PHONE', '(555) 123-4567'),
    contactEmail: getEnvVar('PHARMACY_EMAIL', 'info@vivapharmacy.com')
  }
};

// Get DKIM configuration for nodemailer if enabled
export const getDkimConfig = () => {
  if (!emailConfig.dkim.enabled || !emailConfig.dkim.privateKey) {
    return null;
  }
  
  try {
    return {
      domainName: emailConfig.dkim.domainName,
      keySelector: emailConfig.dkim.keySelector,
      privateKey: emailConfig.dkim.privateKey,
      cacheDir: emailConfig.dkim.cacheDir,
      cacheTreshold: emailConfig.dkim.cacheTreshold
    };
  } catch (error) {
    console.error('Error creating DKIM configuration:', error);
    return null;
  }
};

// Create a configured transporter instance
export const createTransporter = () => {
  const transporterConfig = { ...emailConfig.smtp };
  
  // Add DKIM if enabled
  const dkimConfig = getDkimConfig();
  if (dkimConfig) {
    transporterConfig.dkim = dkimConfig;
  }
  
  return transporterConfig;
};

export default emailConfig; 