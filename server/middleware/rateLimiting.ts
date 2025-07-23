import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request, Response } from 'express';

// Create Redis client for rate limiting - only if Redis is enabled
let redisClient: Redis | null = null;

if (process.env.DISABLE_REDIS !== 'true' && process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: () => null,
      reconnectOnError: () => false,
    });
    
    redisClient.on('error', (err) => {
      console.log('⚠️ Rate limiting Redis not available, using memory store');
      redisClient?.disconnect();
      redisClient = null;
    });
  } catch (error) {
    console.log('⚠️ Rate limiting Redis not available, using memory store');
    redisClient = null;
  }
}

// Default rate limit configuration
const defaultOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.',
      retryAfter: req.rateLimit?.resetTime
    });
  }
};

// Create rate limiter with Redis store if available
export const createRateLimiter = (options: Partial<typeof defaultOptions> = {}) => {
  const config = { ...defaultOptions, ...options };
  
  if (redisClient) {
    // Use Redis store for distributed rate limiting
    return rateLimit({
      ...config,
      store: new RedisStore({
        client: redisClient,
        prefix: 'rate-limit:',
      }),
    });
  }
  
  // Fall back to memory store
  return rateLimit(config);
};

// Different rate limiters for different endpoints
export const rateLimiters = {
  // Strict limit for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful auth
  }),
  
  // Moderate limit for API endpoints
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
  }),
  
  // Relaxed limit for read-only endpoints
  read: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per 15 minutes
  }),
  
  // Strict limit for write operations
  write: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per 15 minutes
  }),
  
  // Very strict limit for expensive operations
  expensive: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
  }),
  
  // Tenant-specific rate limiting
  tenant: (tenantId: string) => createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per 15 minutes per tenant
    keyGenerator: (req: Request) => `${tenantId}:${req.ip}`,
  }),
  
  // User-specific rate limiting
  user: (userId: string) => createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // 150 requests per 15 minutes per user
    keyGenerator: (req: Request) => `user:${userId}`,
    skip: (req: Request) => {
      // Skip rate limiting for admin users
      return (req as any).user?.roles?.includes('super_admin') || false;
    }
  }),
};

// Dynamic rate limiting based on user plan/tier
export const dynamicRateLimiter = () => {
  return createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: (req: Request) => {
      const user = (req as any).user;
      
      // Different limits based on user tier
      if (user?.tier === 'premium') return 500;
      if (user?.tier === 'pro') return 300;
      if (user?.roles?.includes('admin')) return 1000;
      
      return 100; // Default for free tier
    }
  });
};

// IP-based rate limiting with whitelist
export const ipRateLimiter = createRateLimiter({
  skip: (req: Request) => {
    const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelist.includes(req.ip || '');
  }
});

// Export middleware for common use cases
export const authRateLimit = rateLimiters.auth;
export const apiRateLimit = rateLimiters.api;
export const readRateLimit = rateLimiters.read;
export const writeRateLimit = rateLimiters.write;
export const expensiveRateLimit = rateLimiters.expensive;