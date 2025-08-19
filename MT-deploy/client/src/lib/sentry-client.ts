// Life CEO: Sentry Client-Side Error Tracking
// 40x20s Implementation - Client-side with React error boundaries

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Sentry initialization state
let sentryInitialized = false;
let sentryEnabled = true;

// Simple in-memory error storage as fallback
const clientErrorStore: Array<{
  timestamp: Date;
  error: any;
  componentStack?: string;
}> = [];

const MAX_CLIENT_ERRORS = 50;

// Initialize Sentry for React
export const initializeClientSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.log('ℹ️ Sentry DSN not configured for client');
    sentryEnabled = false;
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'development',
      
      // Start with 10% sample rate
      sampleRate: 0.1,
      
      // Disable performance monitoring initially
      tracesSampleRate: 0,
      
      integrations: [
        // Basic browser integration
        Sentry.browserTracingIntegration(),
      ],
      
      // Filter out non-critical errors
      beforeSend(event, hint) {
        const error = hint.originalException as any;
        // Don't send network errors
        if (error?.message?.includes('fetch')) {
          return null;
        }
        // Don't send canceled requests
        if (error?.name === 'AbortError') {
          return null;
        }
        return event;
      },
    });

    sentryInitialized = true;
    console.log('✅ Sentry client error tracking initialized');
    
  } catch (error) {
    console.error('⚠️ Sentry client initialization failed:', error);
    sentryEnabled = false;
  }
};

// Error boundary wrapper component
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Custom error boundary fallback component should be defined in a .tsx file
// For now, export a simple error handler
export const handleErrorFallback = (error: Error, resetError: () => void) => {
  console.error('Error boundary caught:', error);
  // The actual UI component should be imported from a .tsx file
};

// Safe error capture for client
export const captureClientError = (error: Error, componentStack?: string) => {
  try {
    if (sentryInitialized && sentryEnabled) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack,
          },
        },
      });
    } else {
      // Fallback storage
      clientErrorStore.push({
        timestamp: new Date(),
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        componentStack,
      });
      
      // Prevent memory leak
      if (clientErrorStore.length > MAX_CLIENT_ERRORS) {
        clientErrorStore.shift();
      }
      
      console.error('[Client Error]:', error);
    }
  } catch (captureError) {
    console.error('[Client Error Capture Failed]:', error, captureError);
  }
};

// Add user context
export const setSentryUser = (user: any) => {
  if (sentryInitialized && sentryEnabled) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
};

// Clear user context
export const clearSentryUser = () => {
  if (sentryInitialized && sentryEnabled) {
    Sentry.setUser(null);
  }
};

// Test client integration
export const testClientSentry = () => {
  try {
    throw new Error('Client Sentry test error - this is intentional');
  } catch (error) {
    captureClientError(error as Error);
  }
};

// Get client error store
export const getClientErrors = () => {
  return [...clientErrorStore];
};

// Export Sentry for advanced usage
export { Sentry };