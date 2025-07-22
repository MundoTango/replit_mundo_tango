// Life CEO: Sentry Server-side Configuration
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import type { Express } from 'express';

export function initSentry(app: Express) {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        // Express integration
        Sentry.httpIntegration({ tracing: true }),
        Sentry.expressIntegration({ app }),
        // Profiling
        nodeProfilingIntegration(),
      ],
      // Performance monitoring
      tracesSampleRate: 0.1, // 10% sampling
      profilesSampleRate: 0.1, // 10% profiling
      // Environment
      environment: process.env.NODE_ENV,
      release: process.env.APP_VERSION || 'unknown',
      // Server name
      serverName: 'mundo-tango-api',
      // Error filtering
      beforeSend(event, hint) {
        // Filter out expected errors
        const error = hint.originalException as any;
        if (error?.message?.includes('ECONNREFUSED') && error?.message?.includes('Redis')) {
          // Redis connection errors are handled with fallback
          return null;
        }
        return event;
      },
    });

    // Request handler must be first
    app.use(Sentry.expressRequestHandler());
    
    // Tracing handler
    app.use(Sentry.expressTracingHandler());

    console.log('🛡️ Life CEO: Sentry server monitoring initialized');
  }
}

// Error handler middleware (must be after all other middleware)
export const sentryErrorHandler = Sentry.expressErrorHandler({
  shouldHandleError(error: any) {
    // Capture 4xx and 5xx errors
    if (error.status >= 400) {
      return true;
    }
    return false;
  },
});

// Performance monitoring helpers
export const startSpan = (op: string, name: string) => {
  return Sentry.startSpan({ op, name }, () => {});
};

// Custom error logging with context
export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Life CEO Server Error:', error);
  Sentry.captureException(error, {
    extra: context,
    tags: {
      component: 'backend',
    },
  });
};

// Database query monitoring
export const monitorQuery = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  return Sentry.startSpan(
    {
      op: 'db.query',
      name: queryName,
    },
    async () => {
      try {
        return await queryFn();
      } catch (error) {
        Sentry.captureException(error, {
          tags: { query: queryName },
        });
        throw error;
      }
    }
  );
};

// API route monitoring
export const monitorRoute = (routeName: string) => {
  return (req: any, res: any, next: any) => {
    const scope = Sentry.getCurrentScope();
    const transaction = scope.getTransaction();
    if (transaction) {
      transaction.setName(`${req.method} ${routeName}`);
    }
    next();
  };
};