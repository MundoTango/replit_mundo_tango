// Life CEO: BullMQ Background Job Configuration
import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

// Redis connection for BullMQ
// Life CEO Debug: BullMQ requires Redis, but we'll create a minimal connection
// that fails fast if Redis isn't available
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null, // BullMQ requires this to be null
  enableReadyCheck: false,
  retryStrategy: () => null, // Don't retry on connection failure
  reconnectOnError: () => false, // Don't reconnect on errors
});

// Queue definitions
export const queues = {
  email: new Queue('email', { connection }),
  imageProcessing: new Queue('image-processing', { connection }),
  analytics: new Queue('analytics', { connection }),
  notifications: new Queue('notifications', { connection }),
  dataSync: new Queue('data-sync', { connection }),
  performanceMetrics: new Queue('performance-metrics', { connection }),
};

// Note: QueueScheduler is deprecated in BullMQ v3+
// Delayed and repeated jobs are now handled automatically by the Queue

// Queue events for monitoring
export const queueEvents = {
  email: new QueueEvents('email', { connection }),
  imageProcessing: new QueueEvents('image-processing', { connection }),
  analytics: new QueueEvents('analytics', { connection }),
  notifications: new QueueEvents('notifications', { connection }),
  dataSync: new QueueEvents('data-sync', { connection }),
  performanceMetrics: new QueueEvents('performance-metrics', { connection }),
};

// Job types
export interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface ImageProcessingJob {
  imageUrl: string;
  operations: Array<{
    type: 'resize' | 'compress' | 'watermark';
    options: Record<string, any>;
  }>;
}

export interface AnalyticsJob {
  event: string;
  userId: number;
  data: Record<string, any>;
  timestamp: Date;
}

export interface NotificationJob {
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface DataSyncJob {
  type: 'cache-warm' | 'search-index' | 'analytics-aggregate';
  target: string;
  options?: Record<string, any>;
}

export interface PerformanceMetricsJob {
  metrics: {
    url: string;
    loadTime: number;
    renderTime: number;
    userId?: number;
  };
}

// Add job helpers
export const addEmailJob = async (data: EmailJob, options?: any) => {
  return queues.email.add('send-email', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    ...options,
  });
};

export const addImageJob = async (data: ImageProcessingJob, options?: any) => {
  return queues.imageProcessing.add('process-image', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    ...options,
  });
};

export const addAnalyticsJob = async (data: AnalyticsJob, options?: any) => {
  return queues.analytics.add('track-event', data, {
    removeOnComplete: {
      age: 24 * 3600, // 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // 7 days
    },
    ...options,
  });
};

export const addNotificationJob = async (data: NotificationJob, options?: any) => {
  return queues.notifications.add('send-notification', data, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    priority: data.type === 'urgent' ? 1 : 10,
    ...options,
  });
};

export const addDataSyncJob = async (data: DataSyncJob, options?: any) => {
  return queues.dataSync.add(`sync-${data.type}`, data, {
    attempts: 3,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
    ...options,
  });
};

export const addPerformanceMetricsJob = async (data: PerformanceMetricsJob, options?: any) => {
  return queues.performanceMetrics.add('record-metrics', data, {
    removeOnComplete: true,
    attempts: 2,
    ...options,
  });
};

// Scheduled job helpers
export const scheduleRecurringJob = async (
  queueName: keyof typeof queues,
  jobName: string,
  data: any,
  pattern: string // Cron pattern
) => {
  return queues[queueName].add(jobName, data, {
    repeat: {
      pattern,
      tz: 'America/Buenos_Aires',
    },
  });
};

// Queue monitoring
export const getQueueMetrics = async (queueName: keyof typeof queues) => {
  const queue = queues[queueName];
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed,
  };
};

// Initialize BullMQ
export const initializeBullMQ = async () => {
  console.log('🚀 BullMQ: Initializing queues and workers...');
  // Workers will be started in separate processes
  return true;
};

// Graceful shutdown
export const gracefulShutdown = async () => {
  console.log('🛑 Life CEO: Shutting down job queues...');
  
  await Promise.all([
    ...Object.values(queues).map(q => q.close()),
    ...Object.values(queueEvents).map(e => e.close()),
  ]);
  
  await connection.quit();
  console.log('✅ Life CEO: Job queues shut down gracefully');
};