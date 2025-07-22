// Life CEO: Sentry Error Tracking Configuration
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  // Only initialize in production
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing({
          // Set sampling rates
          tracingOrigins: ['localhost', /^\//],
          // Performance monitoring
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            window.history
          ),
        }),
      ],
      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      // Session tracking
      sessionTrackingIntervalMillis: 30000,
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || 'unknown',
      environment: import.meta.env.MODE,
      // Error filtering
      beforeSend(event, hint) {
        // Filter out non-critical errors
        if (event.exception) {
          const error = hint.originalException;
          // Skip network errors in development
          if (error?.message?.includes('Failed to fetch')) {
            return null;
          }
          // Skip cancelled requests
          if (error?.name === 'AbortError') {
            return null;
          }
        }
        return event;
      },
      // User context
      initialScope: {
        tags: {
          component: 'frontend',
          framework: 'react',
        },
      },
    });

    console.log('🛡️ Life CEO: Sentry error tracking initialized');
  }
}

// Enhanced error boundary
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Performance monitoring helpers
export const startTransaction = (name: string, op: string = 'navigation') => {
  return Sentry.startTransaction({ name, op });
};

// Custom error logging
export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Life CEO Error:', error);
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
};

// User identification
export const identifyUser = (user: { id: number; email?: string; name?: string }) => {
  Sentry.setUser({
    id: user.id.toString(),
    email: user.email,
    username: user.name,
  });
};

// Breadcrumb tracking
export const addBreadcrumb = (message: string, category: string = 'custom') => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
};