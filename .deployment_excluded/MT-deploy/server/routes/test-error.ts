// 40x20s Layer 7: Test endpoint for Sentry error tracking
import { Router } from 'express';
import { logError } from '../lib/sentry.js';

const router = Router();

// Test endpoint to verify error tracking works
router.get('/api/test/error', (req, res) => {
  try {
    // Intentional error for testing
    throw new Error('40x20s Sentry test error - this is intentional');
  } catch (error) {
    // Log to Sentry (or fallback)
    logError(error as Error, {
      test: true,
      timestamp: new Date(),
      layer: '40x20s Layer 7'
    });
    
    res.status(500).json({
      message: 'Test error logged successfully',
      sentryEnabled: !!process.env.SENTRY_DSN,
      timestamp: new Date()
    });
  }
});

// Test endpoint to check Sentry status
router.get('/api/test/sentry-status', (req, res) => {
  res.json({
    sentryEnabled: !!process.env.SENTRY_DSN,
    sampleRate: process.env.SENTRY_SAMPLE_RATE || '0.1',
    environment: process.env.NODE_ENV,
    message: process.env.SENTRY_DSN ? 
      'Sentry is configured and active' : 
      'Sentry is disabled (no DSN configured)'
  });
});

export default router;