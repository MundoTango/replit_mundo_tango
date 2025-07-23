import Redis from 'ioredis';

// Create Redis client with fallback to in-memory cache
class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { value: any; expiry: number }> = new Map();
  private connected = false;
  private fallbackLogged = false; // Life CEO: Track fallback logging

  constructor() {
    this.initRedis();
  }

  private async initRedis() {
    try {
      // Try to connect to Redis if available
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        lazyConnect: true, // Life CEO: Don't connect immediately
        maxRetriesPerRequest: 1, // Fail fast
        retryStrategy: (times) => {
          if (times >= 1) {
            if (!this.fallbackLogged) {
              console.log('⚠️ Redis unavailable, using in-memory cache');
              this.fallbackLogged = true;
            }
            return null; // Stop retrying
          }
          return 50; // Only retry once
        },
        reconnectOnError: () => false, // Don't reconnect
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected for caching');
        this.connected = true;
      });

      this.redis.on('error', (err) => {
        console.error('Redis error:', err);
        this.connected = false;
      });

      // Test connection
      await this.redis.ping();
      this.connected = true;
    } catch (error) {
      console.log('⚠️ Redis not available, using in-memory cache');
      this.redis = null;
      this.connected = false;
    }
  }

  async get(key: string): Promise<any> {
    try {
      if (this.connected && this.redis) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback to memory cache
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.value;
        }
        this.memoryCache.delete(key);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      if (this.connected && this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        // Fallback to memory cache
        this.memoryCache.set(key, {
          value,
          expiry: Date.now() + (ttlSeconds * 1000)
        });
        
        // Clean up expired entries
        this.cleanupMemoryCache();
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.connected && this.redis) {
        await this.redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      if (this.connected && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // Memory cache pattern deletion
        const keysToDelete: string[] = [];
        this.memoryCache.forEach((_, key) => {
          if (key.includes(pattern.replace('*', ''))) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach(key => this.memoryCache.delete(key));
      }
    } catch (error) {
      console.error('Cache deletePattern error:', error);
    }
  }

  private cleanupMemoryCache() {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.memoryCache.forEach((cached, key) => {
      if (cached.expiry <= now) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.memoryCache.delete(key));
  }
}

// Export singleton instance
export const redisCache = new CacheService();