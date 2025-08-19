/**
 * ESA LIFE CEO 61x21 - Rate Limiting Middleware
 * Prevents mention spam and abuse to achieve 100/100 security score
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (production would use Redis)
const rateLimitStore: RateLimitStore = {};

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message: string; // Error message
  skipSuccessfulRequests?: boolean;
}

export class RateLimiterService {
  /**
   * Create rate limiter middleware
   */
  static createLimiter(config: RateLimitConfig) {
    return (req: any, res: Response, next: NextFunction) => {
      const userId = req.user?.claims?.sub || req.ip;
      const key = `rate_limit:${userId}`;
      const now = Date.now();
      
      // Clean up expired entries
      if (rateLimitStore[key] && rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key];
      }
      
      // Initialize or get current count
      if (!rateLimitStore[key]) {
        rateLimitStore[key] = {
          count: 0,
          resetTime: now + config.windowMs
        };
      }
      
      const current = rateLimitStore[key];
      
      // Check if limit exceeded
      if (current.count >= config.maxRequests) {
        const timeRemaining = Math.ceil((current.resetTime - now) / 1000);
        
        console.log(`🚫 Rate limit exceeded for ${userId}: ${current.count}/${config.maxRequests}`);
        
        return res.status(429).json({
          success: false,
          message: config.message,
          retryAfter: timeRemaining,
          limit: config.maxRequests,
          current: current.count,
          resetTime: new Date(current.resetTime).toISOString()
        });
      }
      
      // Increment counter
      current.count++;
      
      // Add headers for client awareness
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': (config.maxRequests - current.count).toString(),
        'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
      });
      
      console.log(`✅ Rate limit check passed for ${userId}: ${current.count}/${config.maxRequests}`);
      next();
    };
  }

  /**
   * Mention suggestions rate limiter - prevents spam searches
   */
  static mentionSuggestionsLimiter = this.createLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: 'Too many mention suggestion requests. Please slow down.'
  });

  /**
   * Mention confirmation rate limiter - prevents spam interactions
   */
  static mentionConfirmationLimiter = this.createLimiter({
    windowMs: 60 * 1000, // 1 minute  
    maxRequests: 10, // 10 confirmations per minute
    message: 'Too many mention interactions. Please wait before confirming more mentions.'
  });

  /**
   * General mention creation limiter - prevents mention spam in posts
   */
  static mentionCreationLimiter = this.createLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 mentions per minute
    message: 'Too many mentions created. Please slow down to prevent spam.'
  });

  /**
   * Get rate limit statistics
   */
  static getRateLimitStats(): any {
    const stats = {
      totalEntries: Object.keys(rateLimitStore).length,
      activeEntries: 0,
      expiredEntries: 0
    };
    
    const now = Date.now();
    Object.values(rateLimitStore).forEach(entry => {
      if (entry.resetTime > now) {
        stats.activeEntries++;
      } else {
        stats.expiredEntries++;
      }
    });
    
    return stats;
  }

  /**
   * Clean up expired rate limit entries
   */
  static cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleaned = 0;
    
    Object.keys(rateLimitStore).forEach(key => {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key];
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired rate limit entries`);
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(() => {
  RateLimiterService.cleanupExpiredEntries();
}, 5 * 60 * 1000);