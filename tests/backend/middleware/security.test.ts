import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { createAuthenticatedUser } from '../../factories/userFactory';
import { createAuthHeaders, generateTestToken } from '../../helpers/auth';

// Mock dependencies
jest.mock('../../../server/storage', () => ({
  storage: {
    getUserByReplitId: jest.fn(),
  }
}));

describe('Security Middleware Tests', () => {
  let app: express.Application;
  let mockUser: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    // Import middleware and routes after mocking
    const { registerRoutes } = await import('../../../server/routes');
    await registerRoutes(app);

    mockUser = createAuthenticatedUser();
  });

  describe('CSRF Protection', () => {
    it('should block requests without CSRF token', async () => {
      // Test endpoint that requires CSRF
      const response = await request(app)
        .post('/api/posts')
        .send({ content: 'Test post' })
        .expect(403);

      expect(response.body.message).toContain('CSRF');
    });

    it('should allow requests with valid CSRF token', async () => {
      app.use((req: any, res, next) => {
        req.session = { csrfToken: 'valid-csrf-token' };
        req.user = mockUser;
        req.isAuthenticated = () => true;
        next();
      });

      const response = await request(app)
        .post('/api/test-csrf')
        .set('X-CSRF-Token', 'valid-csrf-token')
        .send({ data: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should exclude certain endpoints from CSRF', async () => {
      // Performance metrics endpoint should be excluded
      const response = await request(app)
        .post('/api/performance/metrics')
        .send({ pageLoadTime: 1234 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 101; i++) {
        promises.push(
          request(app)
            .get('/api/posts/feed')
            .set('X-Forwarded-For', '1.2.3.4')
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);
      
      expect(rateLimited).toBe(true);
    });

    it('should have stricter limits for auth endpoints', async () => {
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .set('X-Forwarded-For', '1.2.3.5')
            .send({ email: 'test@example.com', password: 'wrong' })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);
      
      expect(rateLimited).toBe(true);
    });

    it('should reset rate limits after window', async () => {
      jest.useFakeTimers();

      // First request should succeed
      await request(app)
        .get('/api/posts/feed')
        .set('X-Forwarded-For', '1.2.3.6')
        .expect(200);

      // Advance time past rate limit window
      jest.advanceTimersByTime(15 * 60 * 1000); // 15 minutes

      // Request should succeed again
      await request(app)
        .get('/api/posts/feed')
        .set('X-Forwarded-For', '1.2.3.6')
        .expect(200);

      jest.useRealTimers();
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize HTML in input', async () => {
      app.use((req: any, res, next) => {
        req.session = { csrfToken: 'test-token' };
        req.user = mockUser;
        req.isAuthenticated = () => true;
        next();
      });

      const maliciousInput = {
        content: '<script>alert("XSS")</script>Hello',
        bio: '<img src=x onerror=alert("XSS")>',
      };

      const response = await request(app)
        .post('/api/user/profile')
        .set('X-CSRF-Token', 'test-token')
        .send(maliciousInput)
        .expect(200);

      // Check that dangerous HTML was removed
      expect(response.body.data).not.toContain('<script>');
      expect(response.body.data).not.toContain('onerror=');
    });

    it('should prevent SQL injection attempts', async () => {
      const sqlInjectionAttempt = {
        search: "'; DROP TABLE users; --"
      };

      const response = await request(app)
        .get('/api/users/search')
        .query(sqlInjectionAttempt)
        .expect(200);

      // Should handle the input safely
      expect(response.body.success).toBe(true);
    });

    it('should validate and sanitize file uploads', async () => {
      app.use((req: any, res, next) => {
        req.session = { csrfToken: 'test-token' };
        req.user = mockUser;
        req.isAuthenticated = () => true;
        next();
      });

      // Test dangerous filename
      const response = await request(app)
        .post('/api/upload')
        .set('X-CSRF-Token', 'test-token')
        .attach('file', Buffer.from('test'), '../../../etc/passwd')
        .expect(400);

      expect(response.body.message).toContain('Invalid filename');
    });
  });

  describe('Headers Security', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Check security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    it('should set appropriate CORS headers', async () => {
      const response = await request(app)
        .options('/api/posts')
        .set('Origin', 'https://18b562b7-65d8-4db8-8480-61e8ab9b1db1-00-145w1q6sp1kov.kirk.replit.dev')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });

    it('should block requests from unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/posts')
        .set('Origin', 'https://malicious-site.com')
        .expect(403);

      expect(response.body.message).toContain('CORS');
    });
  });

  describe('Authentication Middleware', () => {
    it('should reject requests without authentication', async () => {
      const protectedEndpoints = [
        '/api/user/profile',
        '/api/posts/create',
        '/api/groups/create'
      ];

      for (const endpoint of protectedEndpoints) {
        await request(app)
          .get(endpoint)
          .expect(401);
      }
    });

    it('should allow authenticated requests', async () => {
      app.use((req: any, res, next) => {
        req.session = { csrfToken: 'test-token' };
        req.user = mockUser;
        req.isAuthenticated = () => true;
        next();
      });

      const response = await request(app)
        .get('/api/user/profile')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle invalid JWT tokens', async () => {
      const invalidToken = 'invalid.jwt.token';

      await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });

    it('should handle expired JWT tokens', async () => {
      const jwt = await import('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: mockUser.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('Request Size Limits', () => {
    it('should reject oversized JSON payloads', async () => {
      const largePayload = {
        content: 'x'.repeat(1024 * 1024 * 2) // 2MB string
      };

      await request(app)
        .post('/api/posts')
        .send(largePayload)
        .expect(413); // Payload too large
    });

    it('should reject oversized file uploads', async () => {
      const largeFile = Buffer.alloc(1024 * 1024 * 11); // 11MB file

      await request(app)
        .post('/api/upload')
        .attach('file', largeFile, 'large.jpg')
        .expect(413);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should handle malicious query parameters safely', async () => {
      const maliciousQueries = [
        "1' OR '1'='1",
        "1; DROP TABLE users;",
        "1 UNION SELECT * FROM users",
        "\\'; DROP TABLE users; --"
      ];

      for (const query of maliciousQueries) {
        const response = await request(app)
          .get('/api/users/search')
          .query({ id: query })
          .expect(200);

        expect(response.body.success).toBe(true);
        // Should return empty results, not execute malicious SQL
        expect(response.body.data).toEqual([]);
      }
    });
  });

  describe('XSS Prevention', () => {
    it('should escape user input in responses', async () => {
      app.use((req: any, res, next) => {
        req.session = { csrfToken: 'test-token' };
        req.user = mockUser;
        req.isAuthenticated = () => true;
        next();
      });

      const xssAttempt = {
        name: '<script>alert("XSS")</script>',
        bio: '<img src=x onerror=alert("XSS")>'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('X-CSRF-Token', 'test-token')
        .send(xssAttempt)
        .expect(200);

      // Response should have escaped dangerous content
      expect(response.body.user.name).not.toContain('<script>');
      expect(response.body.user.bio).not.toContain('onerror=');
    });
  });

  describe('Path Traversal Prevention', () => {
    it('should prevent directory traversal attacks', async () => {
      const traversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
      ];

      for (const attempt of traversalAttempts) {
        const response = await request(app)
          .get('/api/files')
          .query({ path: attempt })
          .expect(400);

        expect(response.body.message).toContain('Invalid path');
      }
    });
  });

  describe('Session Security', () => {
    it('should regenerate session on login', async () => {
      let sessionId: string;

      // First request
      const response1 = await request(app)
        .get('/api/auth/csrf-token')
        .expect(200);

      sessionId = response1.headers['set-cookie']?.[0]?.split(';')[0];

      // Login request
      const response2 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
        .expect(200);

      const newSessionId = response2.headers['set-cookie']?.[0]?.split(';')[0];

      // Session ID should change after login
      expect(newSessionId).not.toBe(sessionId);
    });

    it('should set secure session cookie flags', async () => {
      const response = await request(app)
        .get('/api/auth/csrf-token')
        .expect(200);

      const setCookie = response.headers['set-cookie']?.[0];
      
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('Secure');
      expect(setCookie).toContain('SameSite');
    });
  });
});