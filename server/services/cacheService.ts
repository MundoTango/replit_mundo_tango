import Redis from 'ioredis';

// 40x20s Framework - Layer 10 (Deployment & Infrastructure)
// Redis caching service for performance optimization

class CacheService {
  private redis: Redis | null = null;
  private fallbackCache: Map<string, { data: any; expiry: number }> = new Map();
  private connected = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Use environment variable if available, otherwise use default
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times) => {
          if (times > 3) {
            console.log('⚠️  Redis connection failed, using in-memory fallback cache');
            return null; // Stop retrying
          }
          return Math.min(times * 200, 2000);
        }
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis cache connected');
        this.connected = true;
      });

      this.redis.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
        this.connected = false;
      });

      // Test connection
      await this.redis.ping();
    } catch (error: any) {
      console.error('⚠️  Redis initialization failed, using in-memory cache:', error.message);
      this.redis = null;
      this.connected = false;
    }
  }

  // Get cached data with fallback to in-memory cache
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis && this.connected) {
        const data = await this.redis.get(key);
        if (data) {
          return JSON.parse(data);
        }
      }
    } catch (error: any) {
      console.error('Redis get error:', error.message);
    }

    // Fallback to in-memory cache
    const cached = this.fallbackCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    
    return null;
  }

  // Set cache with TTL (in seconds)
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      if (this.redis && this.connected) {
        await this.redis.setex(key, ttl, JSON.stringify(value));
      }
    } catch (error: any) {
      console.error('Redis set error:', error.message);
    }

    // Always set in fallback cache
    this.fallbackCache.set(key, {
      data: value,
      expiry: Date.now() + (ttl * 1000)
    });

    // Clean up expired entries periodically
    if (this.fallbackCache.size > 1000) {
      this.cleanupFallbackCache();
    }
  }

  // Delete cache entry
  async del(key: string): Promise<void> {
    try {
      if (this.redis && this.connected) {
        await this.redis.del(key);
      }
    } catch (error: any) {
      console.error('Redis del error:', error.message);
    }
    
    this.fallbackCache.delete(key);
  }

  // Clear cache by pattern
  async clearPattern(pattern: string): Promise<void> {
    try {
      if (this.redis && this.connected) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch (error: any) {
      console.error('Redis clear pattern error:', error.message);
    }

    // Clear matching keys from fallback cache
    for (const key of this.fallbackCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        this.fallbackCache.delete(key);
      }
    }
  }

  // Cleanup expired entries from fallback cache
  private cleanupFallbackCache() {
    const now = Date.now();
    for (const [key, value] of this.fallbackCache.entries()) {
      if (value.expiry < now) {
        this.fallbackCache.delete(key);
      }
    }
  }

  // Cache wrapper for async functions
  async cacheable<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }
}

// Export singleton instance
export const cacheService = new CacheService();