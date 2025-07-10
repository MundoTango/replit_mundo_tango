import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { db } from '../db';
import { users, posts, notifications, events, memories } from '@shared/schema';
import { eq, gt, and, lt } from 'drizzle-orm';
import { getCache, invalidateCache } from './cacheService';

// Redis connection for job queue
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Define job types
export enum JobType {
  // Email jobs
  SEND_EMAIL = 'send-email',
  SEND_BULK_EMAIL = 'send-bulk-email',
  
  // Notification jobs
  SEND_NOTIFICATION = 'send-notification',
  PROCESS_NOTIFICATIONS = 'process-notifications',
  
  // Image processing
  PROCESS_IMAGE = 'process-image',
  GENERATE_THUMBNAILS = 'generate-thumbnails',
  
  // Data processing
  CLEANUP_OLD_DATA = 'cleanup-old-data',
  GENERATE_REPORT = 'generate-report',
  SYNC_EXTERNAL_DATA = 'sync-external-data',
  
  // Cache jobs
  WARM_CACHE = 'warm-cache',
  INVALIDATE_CACHE = 'invalidate-cache',
  
  // Analytics
  UPDATE_ANALYTICS = 'update-analytics',
  CALCULATE_TRENDING = 'calculate-trending',
  
  // User tasks
  UPDATE_USER_STATS = 'update-user-stats',
  CLEANUP_INACTIVE_USERS = 'cleanup-inactive-users',
}

// Create queues for different job types
export const queues = {
  email: new Queue('email', { connection: redisConnection }),
  notifications: new Queue('notifications', { connection: redisConnection }),
  images: new Queue('images', { connection: redisConnection }),
  data: new Queue('data', { connection: redisConnection }),
  analytics: new Queue('analytics', { connection: redisConnection }),
};

// Email worker
const emailWorker = new Worker('email', async (job: Job) => {
  const { type, data } = job.data;
  
  switch (type) {
    case JobType.SEND_EMAIL:
      await sendEmail(data);
      break;
    case JobType.SEND_BULK_EMAIL:
      await sendBulkEmails(data);
      break;
  }
}, {
  connection: redisConnection,
  concurrency: 5, // Process 5 emails at a time
});

// Notification worker
const notificationWorker = new Worker('notifications', async (job: Job) => {
  const { type, data } = job.data;
  
  switch (type) {
    case JobType.SEND_NOTIFICATION:
      await sendNotification(data);
      break;
    case JobType.PROCESS_NOTIFICATIONS:
      await processBatchNotifications(data);
      break;
  }
}, {
  connection: redisConnection,
  concurrency: 10,
});

// Image processing worker
const imageWorker = new Worker('images', async (job: Job) => {
  const { type, data } = job.data;
  
  switch (type) {
    case JobType.PROCESS_IMAGE:
      await processImage(data);
      break;
    case JobType.GENERATE_THUMBNAILS:
      await generateThumbnails(data);
      break;
  }
}, {
  connection: redisConnection,
  concurrency: 3, // Limit concurrent image processing
});

// Data processing worker
const dataWorker = new Worker('data', async (job: Job) => {
  const { type, data } = job.data;
  
  switch (type) {
    case JobType.CLEANUP_OLD_DATA:
      await cleanupOldData(data);
      break;
    case JobType.WARM_CACHE:
      await warmCache(data);
      break;
    case JobType.INVALIDATE_CACHE:
      await invalidateCacheJob(data);
      break;
  }
}, {
  connection: redisConnection,
  concurrency: 5,
});

// Analytics worker
const analyticsWorker = new Worker('analytics', async (job: Job) => {
  const { type, data } = job.data;
  
  switch (type) {
    case JobType.UPDATE_ANALYTICS:
      await updateAnalytics(data);
      break;
    case JobType.CALCULATE_TRENDING:
      await calculateTrending(data);
      break;
    case JobType.UPDATE_USER_STATS:
      await updateUserStats(data);
      break;
  }
}, {
  connection: redisConnection,
  concurrency: 3,
});

// Job implementations
async function sendEmail(data: any) {
  // Implementation would use email service
  console.log('Sending email:', data);
  // await emailService.send(data);
}

async function sendBulkEmails(data: any) {
  const { userIds, template, subject } = data;
  
  // Batch process emails
  const batchSize = 50;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    
    // Add individual email jobs
    const jobs = batch.map(userId => ({
      name: JobType.SEND_EMAIL,
      data: {
        type: JobType.SEND_EMAIL,
        data: { userId, template, subject }
      }
    }));
    
    await queues.email.addBulk(jobs);
  }
}

async function sendNotification(data: any) {
  const { userId, type, title, message, metadata } = data;
  
  // Insert notification to database
  await db.insert(notifications).values({
    user_id: userId,
    type,
    title,
    message,
    metadata,
    is_read: false,
    created_at: new Date(),
  });
  
  // Trigger real-time notification if user is online
  // await websocketService.sendToUser(userId, { type: 'notification', data });
}

async function processBatchNotifications(data: any) {
  const { notifications } = data;
  
  // Batch insert notifications
  await db.insert(notifications).values(notifications);
  
  // Send real-time updates
  const userIds = [...new Set(notifications.map(n => n.user_id))];
  // await websocketService.sendToUsers(userIds, { type: 'new-notifications' });
}

async function processImage(data: any) {
  const { imageUrl, operations } = data;
  
  // Image processing logic (resize, optimize, etc.)
  console.log('Processing image:', imageUrl, operations);
  
  // Would use sharp or similar library
  // const processed = await sharp(imageUrl)
  //   .resize(operations.width, operations.height)
  //   .webp({ quality: 80 })
  //   .toBuffer();
}

async function generateThumbnails(data: any) {
  const { imageUrl, sizes } = data;
  
  // Generate multiple thumbnail sizes
  for (const size of sizes) {
    await queues.images.add(JobType.PROCESS_IMAGE, {
      type: JobType.PROCESS_IMAGE,
      data: {
        imageUrl,
        operations: {
          width: size.width,
          height: size.height,
          format: 'webp'
        }
      }
    });
  }
}

async function cleanupOldData(data: any) {
  const { days = 90 } = data;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  // Delete old stories
  await db.delete(stories)
    .where(lt(stories.expires_at, cutoffDate));
  
  // Archive old notifications
  await db.update(notifications)
    .set({ archived: true })
    .where(and(
      lt(notifications.created_at, cutoffDate),
      eq(notifications.is_read, true)
    ));
  
  console.log(`Cleaned up data older than ${days} days`);
}

async function warmCache(data: any) {
  const cache = getCache();
  const { type } = data;
  
  switch (type) {
    case 'trending':
      // Pre-calculate trending content
      const trending = await calculateTrendingContent();
      await cache.set('trending:content', trending, 900); // 15 minutes
      break;
      
    case 'user-feeds':
      // Pre-generate user feeds for active users
      const activeUsers = await getActiveUsers();
      for (const user of activeUsers) {
        const feed = await generateUserFeed(user.id);
        await cache.set(`feed:${user.id}:1`, feed, 300); // 5 minutes
      }
      break;
  }
}

async function invalidateCacheJob(data: any) {
  const { patterns } = data;
  await invalidateCache(patterns);
}

async function updateAnalytics(data: any) {
  // Update various analytics metrics
  console.log('Updating analytics:', data);
  
  // Would update analytics database or external service
}

async function calculateTrending(data: any) {
  const trending = await calculateTrendingContent();
  
  // Cache the results
  const cache = getCache();
  await cache.set('trending:content', trending, 900);
  
  // Update database if needed
  console.log('Calculated trending content:', trending.length, 'items');
}

async function updateUserStats(data: any) {
  const { userId } = data;
  
  // Calculate user statistics
  const postCount = await db.select().from(posts)
    .where(eq(posts.user_id, userId));
    
  const eventCount = await db.select().from(events)
    .where(eq(events.user_id, userId));
  
  // Update user profile with stats
  // await db.update(users).set({ stats: { posts: postCount.length, events: eventCount.length } })
}

// Helper functions
async function calculateTrendingContent() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Get trending posts
  const trending = await db.select().from(posts)
    .where(and(
      gt(posts.created_at, twentyFourHoursAgo),
      eq(posts.visibility, 'public')
    ))
    .orderBy(posts.created_at)
    .limit(50);
  
  return trending;
}

async function getActiveUsers() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const active = await db.select().from(users)
    .where(gt(users.last_seen, oneHourAgo))
    .limit(100);
  
  return active;
}

async function generateUserFeed(userId: number) {
  // Implementation would generate personalized feed
  return [];
}

// Queue event listeners for monitoring
Object.values(queues).forEach((queue, index) => {
  const queueEvents = new QueueEvents(queue.name, { connection: redisConnection });
  
  queueEvents.on('completed', ({ jobId, returnvalue }) => {
    console.log(`Job ${jobId} completed in queue ${queue.name}`);
  });
  
  queueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`Job ${jobId} failed in queue ${queue.name}:`, failedReason);
  });
});

// Scheduled jobs setup
export function setupScheduledJobs() {
  // Clean up old data daily at 3 AM
  queues.data.add(
    JobType.CLEANUP_OLD_DATA,
    { type: JobType.CLEANUP_OLD_DATA, data: { days: 90 } },
    {
      repeat: {
        pattern: '0 3 * * *', // Cron pattern
      },
    }
  );
  
  // Update trending content every hour
  queues.analytics.add(
    JobType.CALCULATE_TRENDING,
    { type: JobType.CALCULATE_TRENDING, data: {} },
    {
      repeat: {
        every: 60 * 60 * 1000, // 1 hour
      },
    }
  );
  
  // Warm cache every 5 minutes
  queues.data.add(
    JobType.WARM_CACHE,
    { type: JobType.WARM_CACHE, data: { type: 'trending' } },
    {
      repeat: {
        every: 5 * 60 * 1000, // 5 minutes
      },
    }
  );
  
  console.log('Scheduled jobs set up successfully');
}

// Job queue utilities
export const jobQueue = {
  // Add a job to queue
  async addJob(queue: keyof typeof queues, type: JobType, data: any, options?: any) {
    return await queues[queue].add(type, { type, data }, options);
  },
  
  // Add bulk jobs
  async addBulkJobs(queue: keyof typeof queues, jobs: Array<{ type: JobType, data: any }>) {
    const bulkJobs = jobs.map(job => ({
      name: job.type,
      data: job,
    }));
    return await queues[queue].addBulk(bulkJobs);
  },
  
  // Get job counts
  async getJobCounts(queue: keyof typeof queues) {
    const q = queues[queue];
    const [waiting, active, completed, failed] = await Promise.all([
      q.getWaitingCount(),
      q.getActiveCount(),
      q.getCompletedCount(),
      q.getFailedCount(),
    ]);
    
    return { waiting, active, completed, failed };
  },
  
  // Clear queue
  async clearQueue(queue: keyof typeof queues) {
    await queues[queue].drain();
  },
};