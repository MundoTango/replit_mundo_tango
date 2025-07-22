// Life CEO: Email processing worker
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { EmailJob } from '../lib/bullmq-config.js';
import { logError } from '../lib/sentry.js';
import { monitorQueueJob, lifeCeoMetrics } from '../lib/prometheus-metrics.js';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

// Email worker
export const emailWorker = new Worker<EmailJob>(
  'email',
  async (job) => {
    return monitorQueueJob('email', 'send-email', async () => {
      console.log(`📧 Processing email job ${job.id}`);
      const { to, subject, template, data } = job.data;
      
      try {
        // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
        console.log(`📤 Sending email to ${to}: ${subject}`);
        
        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Track metrics
        lifeCeoMetrics.performanceOptimizations.inc({ optimization_type: 'email_sent' });
        
        return { success: true, messageId: `msg_${Date.now()}` };
      } catch (error) {
        logError(error as Error, { jobId: job.id, to, subject });
        throw error;
      }
    });
  },
  {
    connection,
    concurrency: 5,
  }
);

emailWorker.on('completed', (job) => {
  console.log(`✅ Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job ${job?.id} failed:`, err);
  logError(err, { jobId: job?.id });
});

console.log('📧 Life CEO: Email worker started');