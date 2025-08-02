import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

describe('Performance Middleware Tests', () => {
  let app: express.Application;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    const { registerRoutes } = await import('../../../server/routes');
    await registerRoutes(app);
  });

  describe('Response Compression', () => {
    it('should compress large responses', async () => {
      // Request with Accept-Encoding
      const response = await request(app)
        .get('/api/posts/feed')
        .set('Accept-Encoding', 'gzip, deflate')
        .expect(200);

      // Check if response is compressed
      expect(response.headers['content-encoding']).toMatch(/gzip|deflate/);
    });

    it('should not compress small responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Accept-Encoding', 'gzip, deflate')
        .expect(200);

      // Small responses shouldn't be compressed
      expect(response.headers['content-encoding']).toBeUndefined();
    });

    it('should respect client compression preferences', async () => {
      const response = await request(app)
        .get('/api/posts/feed')
        .set('Accept-Encoding', 'identity') // No compression
        .expect(200);

      expect(response.headers['content-encoding']).toBeUndefined();
    });
  });

  describe('Caching Headers', () => {
    it('should set cache headers for static content', async () => {
      const response = await request(app)
        .get('/static/logo.png')
        .expect(200);

      expect(response.headers['cache-control']).toContain('max-age=');
      expect(response.headers['etag']).toBeDefined();
    });

    it('should not cache sensitive endpoints', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .expect(401); // Will fail auth, but we can check headers

      expect(response.headers['cache-control']).toContain('no-store');
    });

    it('should handle conditional requests', async () => {
      // First request to get ETag
      const response1 = await request(app)
        .get('/api/events/feed')
        .expect(200);

      const etag = response1.headers['etag'];

      // Second request with If-None-Match
      if (etag) {
        const response2 = await request(app)
          .get('/api/events/feed')
          .set('If-None-Match', etag)
          .expect(304); // Not Modified

        expect(response2.body).toEqual({});
      }
    });
  });

  describe('Request Timeout', () => {
    it('should timeout long-running requests', async () => {
      // Create endpoint that delays
      app.get('/test/slow', async (req, res) => {
        await new Promise(resolve => setTimeout(resolve, 31000)); // 31 seconds
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test/slow')
        .timeout(35000) // Test timeout longer than request timeout
        .expect(408); // Request Timeout

      expect(response.body.message).toContain('timeout');
    }, 40000);

    it('should complete fast requests normally', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Response Time Headers', () => {
    it('should add response time header', async () => {
      const response = await request(app)
        .get('/api/posts/feed')
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/^\d+ms$/);
    });

    it('should log slow requests', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Create artificially slow endpoint
      app.get('/test/very-slow', async (req, res) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        res.json({ success: true });
      });

      await request(app)
        .get('/test/very-slow')
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow request detected')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Connection Keep-Alive', () => {
    it('should maintain persistent connections', async () => {
      const agent = request.agent(app);

      // Multiple requests using same agent
      const response1 = await agent.get('/api/health').expect(200);
      const response2 = await agent.get('/api/posts/feed').expect(200);

      // Should use keep-alive
      expect(response1.headers['connection']).toBe('keep-alive');
      expect(response2.headers['connection']).toBe('keep-alive');
    });

    it('should respect connection close header', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Connection', 'close')
        .expect(200);

      expect(response.headers['connection']).toBe('close');
    });
  });

  describe('Memory Management', () => {
    it('should handle memory pressure gracefully', async () => {
      // Simulate memory pressure
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn(() => ({
        heapUsed: 1024 * 1024 * 1024 * 1.5, // 1.5GB
        heapTotal: 1024 * 1024 * 1024 * 2, // 2GB
        rss: 1024 * 1024 * 1024 * 2,
        external: 0,
        arrayBuffers: 0
      }));

      const response = await request(app)
        .get('/api/posts/feed')
        .expect(200);

      // Should still work but might have reduced functionality
      expect(response.body.success).toBe(true);

      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('Request Batching', () => {
    it('should support request batching', async () => {
      const batchRequest = {
        requests: [
          { method: 'GET', path: '/api/health' },
          { method: 'GET', path: '/api/posts/feed' },
          { method: 'GET', path: '/api/events/feed' }
        ]
      };

      const response = await request(app)
        .post('/api/batch')
        .send(batchRequest)
        .expect(200);

      expect(response.body.responses).toHaveLength(3);
      expect(response.body.responses[0].success).toBe(true);
    });

    it('should limit batch size', async () => {
      const largeBatch = {
        requests: Array(101).fill({ method: 'GET', path: '/api/health' })
      };

      await request(app)
        .post('/api/batch')
        .send(largeBatch)
        .expect(400);
    });
  });

  describe('Resource Pooling', () => {
    it('should reuse database connections', async () => {
      // Make multiple concurrent requests
      const promises = Array(10).fill(null).map(() =>
        request(app).get('/api/posts/feed')
      );

      const responses = await Promise.all(promises);
      
      // All should succeed without connection exhaustion
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit on repeated failures', async () => {
      // Mock external service failure
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Service down'));

      // Make multiple failing requests
      for (let i = 0; i < 5; i++) {
        await request(app)
          .get('/api/external/service')
          .expect(503);
      }

      // Circuit should be open now
      const response = await request(app)
        .get('/api/external/service')
        .expect(503);

      expect(response.body.message).toContain('Circuit breaker open');

      global.fetch = originalFetch;
    });

    it('should close circuit after timeout', async () => {
      jest.useFakeTimers();

      // Open circuit
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Service down'));

      for (let i = 0; i < 5; i++) {
        await request(app).get('/api/external/service');
      }

      // Advance time to allow circuit to close
      jest.advanceTimersByTime(60000); // 1 minute

      // Mock service recovery
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'success' })
      });

      const response = await request(app)
        .get('/api/external/service')
        .expect(200);

      expect(response.body.success).toBe(true);

      global.fetch = originalFetch;
      jest.useRealTimers();
    });
  });

  describe('Performance Metrics Collection', () => {
    it('should collect and expose metrics', async () => {
      // Make some requests to generate metrics
      await request(app).get('/api/posts/feed');
      await request(app).get('/api/events/feed');
      await request(app).get('/api/health');

      const response = await request(app)
        .get('/metrics')
        .expect(200);

      // Should contain Prometheus-formatted metrics
      expect(response.text).toContain('http_request_duration_seconds');
      expect(response.text).toContain('http_requests_total');
      expect(response.text).toContain('nodejs_heap_size_used_bytes');
    });
  });

  describe('Lazy Loading', () => {
    it('should support pagination for large datasets', async () => {
      const response = await request(app)
        .get('/api/posts/feed')
        .query({ limit: 10, offset: 0 })
        .expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        limit: 10,
        offset: 0,
        hasMore: expect.any(Boolean)
      });
    });

    it('should limit maximum page size', async () => {
      const response = await request(app)
        .get('/api/posts/feed')
        .query({ limit: 1000 })
        .expect(200);

      // Should cap at reasonable limit
      expect(response.body.data.length).toBeLessThanOrEqual(100);
    });
  });

  describe('CDN Integration', () => {
    it('should set CDN-friendly headers for static assets', async () => {
      const response = await request(app)
        .get('/static/images/logo.png')
        .expect(200);

      expect(response.headers['cache-control']).toContain('public');
      expect(response.headers['cache-control']).toContain('immutable');
      expect(response.headers['vary']).toContain('Accept-Encoding');
    });

    it('should provide stale-while-revalidate for dynamic content', async () => {
      const response = await request(app)
        .get('/api/events/feed')
        .expect(200);

      expect(response.headers['cache-control']).toContain('stale-while-revalidate');
    });
  });
});