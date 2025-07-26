import pino from 'pino';
import { IncomingMessage, ServerResponse } from 'http';

// Life CEO 40x20s Enhanced Logging Configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

// Create base logger with 40x20s performance optimizations
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  // Phase 4 intelligent logging
  messageKey: 'message',
  errorKey: 'error',
  // 40x20s structured logging for better analysis
  base: {
    service: 'mundo-tango-life-ceo',
    phase: 'phase-4',
    framework: '40x20s'
  },
  // Development pretty printing
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss TT',
        ignore: 'pid,hostname',
        messageFormat: '{levelLabel} - {message}'
      }
    }
  }),
  // Production optimizations
  ...(!isDevelopment && {
    // Faster serialization in production
    serializers: {
      req: (req: IncomingMessage) => ({
        method: req.method,
        url: req.url,
        headers: req.headers
      }),
      res: (res: ServerResponse) => ({
        statusCode: res.statusCode
      }),
      err: pino.stdSerializers.err
    }
  })
});

// Create child loggers for different phases
export const phase1Logger = logger.child({ phase: 'phase-1-foundation' });
export const phase2Logger = logger.child({ phase: 'phase-2-api' });
export const phase3Logger = logger.child({ phase: 'phase-3-performance' });
export const phase4Logger = logger.child({ phase: 'phase-4-intelligence' });

// Life CEO specific loggers
export const lifeCeoLogger = logger.child({ component: 'life-ceo' });
export const performanceLogger = logger.child({ component: 'performance' });
export const cacheLogger = logger.child({ component: 'cache' });
export const dbLogger = logger.child({ component: 'database' });

// 40x20s learnings logger
export const learningsLogger = logger.child({ 
  component: 'learnings',
  framework: '40x20s'
});

// Utility functions for common logging patterns
export const logPerformanceMetric = (metric: string, value: number, metadata?: any) => {
  performanceLogger.info({ metric, value, ...metadata }, `Performance: ${metric} = ${value}`);
};

export const logCacheHit = (key: string, hitRate?: number) => {
  cacheLogger.debug({ key, hitRate, event: 'cache_hit' }, `Cache hit: ${key}`);
};

export const logCacheMiss = (key: string) => {
  cacheLogger.debug({ key, event: 'cache_miss' }, `Cache miss: ${key}`);
};

export const logDatabaseQuery = (query: string, duration: number) => {
  dbLogger.debug({ query, duration, event: 'db_query' }, `Query executed in ${duration}ms`);
};

export const logLearning = (learning: string, confidence: number) => {
  learningsLogger.info({ 
    learning, 
    confidence, 
    timestamp: new Date().toISOString() 
  }, `New 40x20s learning: ${learning}`);
};

// Export all loggers
export default logger;