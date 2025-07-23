// Rate Limiter for Onboarding
// Prevents spam registrations and abuse

import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

interface RateLimiterOptions {
  points: number; // Number of allowed requests
  duration: number; // Per duration in seconds
  blockDuration?: number; // Block duration in seconds after limit exceeded
}

class OnboardingRateLimiter {
  private limiters: Map<string, any> = new Map();
  private redis: Redis | null = null;

  constructor() {
    // Try to connect to Redis if available
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
        console.log('✅ Redis connected for rate limiting');
      }
    } catch (error) {
      console.log('⚠️ Redis not available, using in-memory rate limiting');
    }
  }

  createLimiter(name: string, options: RateLimiterOptions) {
    const limiterOptions = {
      keyPrefix: `onboarding_${name}`,
      points: options.points,
      duration: options.duration,
      blockDuration: options.blockDuration || options.duration,
    };

    const limiter = this.redis
      ? new RateLimiterRedis({
          storeClient: this.redis,
          ...limiterOptions
        })
      : new RateLimiterMemory(limiterOptions);

    this.limiters.set(name, limiter);
    return limiter;
  }

  async checkRegistrationLimit(ip: string): Promise<boolean> {
    if (!this.limiters.has('registration')) {
      this.createLimiter('registration', {
        points: 5, // 5 registration attempts
        duration: 3600, // per hour
        blockDuration: 7200 // block for 2 hours
      });
    }

    const limiter = this.limiters.get('registration');
    
    try {
      await limiter.consume(ip);
      return true;
    } catch (rejRes: any) {
      console.warn(`⚠️ Rate limit exceeded for IP ${ip}: ${rejRes.remainingPoints} points remaining`);
      return false;
    }
  }

  async checkCityGroupCreation(userId: number): Promise<boolean> {
    if (!this.limiters.has('cityGroup')) {
      this.createLimiter('cityGroup', {
        points: 10, // 10 city group creations
        duration: 86400, // per day
      });
    }

    const limiter = this.limiters.get('cityGroup');
    
    try {
      await limiter.consume(`user_${userId}`);
      return true;
    } catch (rejRes: any) {
      console.warn(`⚠️ City group creation rate limit exceeded for user ${userId}`);
      return false;
    }
  }

  async checkApiLimit(endpoint: string, identifier: string): Promise<boolean> {
    if (!this.limiters.has(endpoint)) {
      // Default API limits
      this.createLimiter(endpoint, {
        points: 100, // 100 requests
        duration: 60, // per minute
      });
    }

    const limiter = this.limiters.get(endpoint);
    
    try {
      await limiter.consume(identifier);
      return true;
    } catch (rejRes: any) {
      return false;
    }
  }

  async getRemainingPoints(limiterName: string, identifier: string): Promise<number> {
    const limiter = this.limiters.get(limiterName);
    if (!limiter) return 0;

    try {
      const res = await limiter.get(identifier);
      return res ? res.remainingPoints : limiter.points;
    } catch (error) {
      return 0;
    }
  }

  // Reset rate limit for specific identifier
  async reset(limiterName: string, identifier: string): Promise<void> {
    const limiter = this.limiters.get(limiterName);
    if (!limiter) return;

    try {
      await limiter.delete(identifier);
      console.log(`✅ Reset rate limit for ${limiterName}:${identifier}`);
    } catch (error) {
      console.error(`❌ Failed to reset rate limit:`, error);
    }
  }
}

export const onboardingRateLimiter = new OnboardingRateLimiter();