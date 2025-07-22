// Life CEO: Prometheus Metrics Configuration
import { register, collectDefaultMetrics, Counter, Histogram, Gauge, Summary } from 'prom-client';
import type { Request, Response } from 'express';

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({
  prefix: 'mundotango_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: 'mundotango_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new Counter({
  name: 'mundotango_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeConnections = new Gauge({
  name: 'mundotango_active_connections',
  help: 'Number of active connections',
});

export const databaseQueryDuration = new Histogram({
  name: 'mundotango_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

export const cacheHitRate = new Gauge({
  name: 'mundotango_cache_hit_rate',
  help: 'Cache hit rate percentage',
  labelNames: ['cache_type'],
});

export const queueJobsTotal = new Counter({
  name: 'mundotango_queue_jobs_total',
  help: 'Total number of queue jobs processed',
  labelNames: ['queue_name', 'status'],
});

export const queueJobDuration = new Histogram({
  name: 'mundotango_queue_job_duration_seconds',
  help: 'Duration of queue job processing',
  labelNames: ['queue_name', 'job_type'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
});

export const memoryUsage = new Gauge({
  name: 'mundotango_memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type'],
});

export const errorRate = new Counter({
  name: 'mundotango_errors_total',
  help: 'Total number of errors',
  labelNames: ['error_type', 'severity'],
});

export const userActivity = new Counter({
  name: 'mundotango_user_activity_total',
  help: 'User activity metrics',
  labelNames: ['action', 'user_type'],
});

export const apiResponseTime = new Summary({
  name: 'mundotango_api_response_time_seconds',
  help: 'API response time summary',
  labelNames: ['endpoint'],
  percentiles: [0.5, 0.9, 0.95, 0.99],
});

// Middleware to track HTTP metrics
export const metricsMiddleware = (req: Request, res: Response, next: any) => {
  const start = Date.now();
  
  // Increment active connections
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode.toString(),
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
    activeConnections.dec();
    
    // Track API response time for specific endpoints
    if (route.startsWith('/api/')) {
      apiResponseTime.observe({ endpoint: route }, duration);
    }
  });
  
  next();
};

// Database query monitoring helper
export const monitorDatabaseQuery = async <T>(
  queryType: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  
  try {
    const result = await queryFn();
    const duration = (Date.now() - start) / 1000;
    databaseQueryDuration.observe({ query_type: queryType, table }, duration);
    return result;
  } catch (error) {
    errorRate.inc({ error_type: 'database', severity: 'high' });
    throw error;
  }
};

// Cache monitoring helper
export const updateCacheMetrics = (cacheType: string, hits: number, total: number) => {
  const hitRate = total > 0 ? (hits / total) * 100 : 0;
  cacheHitRate.set({ cache_type: cacheType }, hitRate);
};

// Queue job monitoring helper
export const monitorQueueJob = async <T>(
  queueName: string,
  jobType: string,
  jobFn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  
  try {
    const result = await jobFn();
    const duration = (Date.now() - start) / 1000;
    queueJobDuration.observe({ queue_name: queueName, job_type: jobType }, duration);
    queueJobsTotal.inc({ queue_name: queueName, status: 'success' });
    return result;
  } catch (error) {
    queueJobsTotal.inc({ queue_name: queueName, status: 'failure' });
    errorRate.inc({ error_type: 'queue', severity: 'medium' });
    throw error;
  }
};

// Memory monitoring
export const updateMemoryMetrics = () => {
  const usage = process.memoryUsage();
  memoryUsage.set({ type: 'heap_used' }, usage.heapUsed);
  memoryUsage.set({ type: 'heap_total' }, usage.heapTotal);
  memoryUsage.set({ type: 'rss' }, usage.rss);
  memoryUsage.set({ type: 'external' }, usage.external);
};

// Start periodic memory monitoring
setInterval(updateMemoryMetrics, 30000); // Every 30 seconds

// User activity tracking
export const trackUserActivity = (action: string, userType: string = 'registered') => {
  userActivity.inc({ action, user_type: userType });
};

// Error tracking
export const trackError = (errorType: string, severity: 'low' | 'medium' | 'high' | 'critical') => {
  errorRate.inc({ error_type: errorType, severity });
};

// Metrics endpoint handler
export const metricsHandler = async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end();
  }
};

// Custom metrics for Life CEO features
export const lifeCeoMetrics = {
  agentCalls: new Counter({
    name: 'lifeceo_agent_calls_total',
    help: 'Total number of Life CEO agent calls',
    labelNames: ['agent_name', 'action'],
  }),
  
  performanceOptimizations: new Counter({
    name: 'lifeceo_optimizations_total',
    help: 'Total number of performance optimizations applied',
    labelNames: ['optimization_type'],
  }),
  
  cacheEfficiency: new Gauge({
    name: 'lifeceo_cache_efficiency',
    help: 'Life CEO cache efficiency percentage',
  }),
  
  predictiveAccuracy: new Gauge({
    name: 'lifeceo_predictive_accuracy',
    help: 'Life CEO predictive loading accuracy',
  }),
};

// Get queue metrics helper
export const getQueueMetrics = async (queueName: string) => {
  // This would be integrated with BullMQ queue metrics
  // For now, return mock data
  return {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
  };
};

console.log('📊 Life CEO: Prometheus metrics initialized');