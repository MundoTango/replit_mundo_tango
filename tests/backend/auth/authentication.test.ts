import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import { createTestUser, createAuthenticatedUser, createAdminUser } from '../../factories/userFactory';
import { createAuthHeaders, generateTestToken, mockAuthenticated } from '../../helpers/auth';

// Mock dependencies
jest.mock('../../../server/storage', () => ({
  storage: {
    getUserByEmail: jest.fn(),
    getUserByReplitId: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    upsertUser: jest.fn(),
    getUserRoles: jest.fn(),
    createUserProfile: jest.fn(),
  }
}));

// Import after mocking
import { storage } from '../../../server/storage';

describe('Authentication Tests', () => {
  let app: express.Application;
  let mockUser: any;

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set up Express app with middleware
    app = express();
    app.use(express.json());
    
    // Mock session middleware
    app.use((req: any, res, next) => {
      req.session = {
        csrfToken: 'test-csrf-token',
        save: jest.fn((cb: any) => cb()),
        destroy: jest.fn((cb: any) => cb())
      };
      req.isAuthenticated = jest.fn(() => false);
      req.logout = jest.fn((cb: any) => cb());
      next();
    });

    // Import routes
    const { registerRoutes } = await import('../../../server/routes');
    await registerRoutes(app);

    // Set up test user
    mockUser = createAuthenticatedUser();
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testPassword123!'
      };

      // Mock storage responses
      (storage.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username
        })
      });
      
      expect(storage.getUserByEmail).toHaveBeenCalledWith(loginData.email);
    });

    it('should fail with invalid email', async () => {
      (storage.getUserByEmail as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid email or password'
      });
    });

    it('should fail with incorrect password', async () => {
      (storage.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid email or password'
      });
    });

    it('should fail with suspended account', async () => {
      const suspendedUser = { ...mockUser, suspended: true };
      (storage.getUserByEmail as jest.Mock).mockResolvedValue(suspendedUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testPassword123!'
        })
        .expect(403);

      expect(response.body.message).toContain('suspended');
    });

    it('should fail with inactive account', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      (storage.getUserByEmail as jest.Mock).mockResolvedValue(inactiveUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testPassword123!'
        })
        .expect(403);

      expect(response.body.message).toContain('deactivated');
    });
  });

  describe('GET /api/auth/user', () => {
    it('should return user data when authenticated', async () => {
      // Mock authenticated request
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });

      const response = await request(app)
        .get('/api/auth/user')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username
      });
    });

    it('should return auth bypass user in development mode', async () => {
      const bypassUser = createAuthenticatedUser();
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(bypassUser);

      const response = await request(app)
        .get('/api/auth/user')
        .expect(200);

      expect(response.body).toMatchObject({
        id: bypassUser.id,
        email: bypassUser.email
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout authenticated user', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logout successful'
      });
    });

    it('should handle logout for non-authenticated users', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logout successful'
      });
    });
  });

  describe('GET /api/auth/csrf-token', () => {
    it('should return CSRF token', async () => {
      const response = await request(app)
        .get('/api/auth/csrf-token')
        .expect(200);

      expect(response.body).toMatchObject({
        csrfToken: expect.any(String)
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh authentication token', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: expect.objectContaining({
          id: mockUser.id
        })
      });
    });

    it('should fail for non-authenticated users', async () => {
      await request(app)
        .post('/api/auth/refresh')
        .expect(401);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should successfully change password', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.updateUser as jest.Mock).mockResolvedValue({ ...mockUser });

      const response = await request(app)
        .post('/api/auth/change-password')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({
          currentPassword: 'testPassword123!',
          newPassword: 'newPassword123!'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Password changed successfully'
      });

      expect(storage.updateUser).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          password: expect.any(String) // Should be hashed
        })
      );
    });

    it('should fail with incorrect current password', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword123!'
        })
        .expect(401);

      expect(response.body.message).toContain('Current password is incorrect');
    });

    it('should fail for non-authenticated users', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'password',
          newPassword: 'newPassword'
        })
        .expect(401);
    });
  });

  describe('Authentication Middleware', () => {
    it('should allow access to protected routes with valid authentication', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });

      // Test a protected route
      const response = await request(app)
        .get('/api/user/profile')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should block access to protected routes without authentication', async () => {
      // Test various protected routes
      const protectedRoutes = [
        '/api/user/profile',
        '/api/posts/create',
        '/api/groups/create',
        '/api/events/create'
      ];

      for (const route of protectedRoutes) {
        await request(app)
          .get(route)
          .expect(401);
      }
    });

    it('should handle expired tokens gracefully', async () => {
      const expiredToken = jwt.sign(
        { id: mockUser.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});