// Life CEO: Metrics and monitoring routes
import { Router } from 'express';
import { metricsHandler, getQueueMetrics } from '../lib/prometheus-metrics.js';
import { queues } from '../lib/bullmq-config.js';

const router = Router();

// Prometheus metrics endpoint
router.get('/metrics', metricsHandler);

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbHealthy = true; // TODO: Add actual DB health check
    
    // Check Redis connection
    const redisHealthy = true; // TODO: Add actual Redis health check
    
    // Get queue health
    const queueHealth = await Promise.all(
      Object.keys(queues).map(async (queueName) => {
        const metrics = await getQueueMetrics(queueName as keyof typeof queues);
        return {
          queue: queueName,
          healthy: metrics.failed < 100, // Arbitrary threshold
          metrics,
        };
      })
    );
    
    const allHealthy = dbHealthy && redisHealthy && queueHealth.every(q => q.healthy);
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        redis: redisHealthy ? 'healthy' : 'unhealthy',
        queues: queueHealth,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: (error as Error).message,
    });
  }
});

// Queue dashboard data
router.get('/admin/queues', async (req, res) => {
  try {
    const queueStats = await Promise.all(
      Object.entries(queues).map(async ([name, queue]) => {
        const metrics = await getQueueMetrics(name as keyof typeof queues);
        return {
          name,
          ...metrics,
        };
      })
    );
    
    res.json({
      success: true,
      queues: queueStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;