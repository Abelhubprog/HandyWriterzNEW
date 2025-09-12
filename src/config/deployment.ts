/**
 * Deployment Configuration
 * 
 * Handles deployment-specific settings and validation for different environments.
 * Similar to Clerk's deployment configuration but customized for our Appwrite setup.
 * 
 * @file src/config/deployment.ts
 */

import { PRODUCTION_URLS, PRODUCTION_SECURITY } from './production';

// Deployment Environments
export const ENVIRONMENTS = {
  PRODUCTION: 'production',
  STAGING: 'staging',
  DEVELOPMENT: 'development',
} as const;

// Current Environment
export const CURRENT_ENV = import.meta.env.PROD 
  ? ENVIRONMENTS.PRODUCTION 
  : import.meta.env.MODE === 'staging' 
    ? ENVIRONMENTS.STAGING 
    : ENVIRONMENTS.DEVELOPMENT;

// Environment-specific configurations
export const ENV_CONFIG = {
  production: {
    urls: PRODUCTION_URLS,
    security: PRODUCTION_SECURITY,
    features: {
      debugMode: false,
      analytics: true,
      errorReporting: true,
      performanceMonitoring: true,
    },
  },
  staging: {
    urls: {
      APP_URL: import.meta.env.VITE_STAGING_APP_URL || 'https://staging.handywriterz.com',
      API_URL: import.meta.env.VITE_STAGING_API_URL || 'https://staging-api.handywriterz.com',
      ADMIN_URL: import.meta.env.VITE_STAGING_ADMIN_URL || 'https://staging-admin.handywriterz.com',
      ACCOUNTS_URL: import.meta.env.VITE_STAGING_ACCOUNTS_URL || 'https://staging-accounts.handywriterz.com',
    },
    security: {
      ...PRODUCTION_SECURITY,
      headers: {
        ...PRODUCTION_SECURITY.headers,
        'Content-Security-Policy': PRODUCTION_SECURITY.headers['Content-Security-Policy']
          .replace('upgrade-insecure-requests', '')
          .replace('strict-dynamic', ''),
      },
    },
    features: {
      debugMode: true,
      analytics: true,
      errorReporting: true,
      performanceMonitoring: true,
    },
  },
  development: {
    urls: {
      APP_URL: 'http://localhost:5173',
      API_URL: 'http://localhost:3000',
      ADMIN_URL: 'http://localhost:5173/admin',
      ACCOUNTS_URL: 'http://localhost:5173/auth',
    },
    security: {
      headers: {},
      cors: {
        origin: ['http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      },
    },
    features: {
      debugMode: true,
      analytics: false,
      errorReporting: true,
      performanceMonitoring: false,
    },
  },
} as const;

// Get current environment configuration
export const getCurrentEnvConfig = () => ENV_CONFIG[CURRENT_ENV];

// Validate environment configuration
export const validateEnvConfig = () => {
  const config = getCurrentEnvConfig();
  const envName = CURRENT_ENV.toUpperCase();

  // Validate essential URLs
  if (!config.urls.APP_URL || !config.urls.API_URL) {
    throw new Error(
      `Missing required URL for ${envName} environment: APP_URL and API_URL are required.\n` +
      'Please check your environment variables.'
    );
  }

  return true;
};

// Default export current environment configuration
export default getCurrentEnvConfig();