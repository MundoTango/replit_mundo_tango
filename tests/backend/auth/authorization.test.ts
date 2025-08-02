import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { createAuthenticatedUser, createAdminUser } from '../../factories/userFactory';
import { createAuthHeaders, generateTestToken, mockAuthenticated } from '../../helpers/auth';

// Mock dependencies
jest.mock('../../../server/storage', () => ({
  storage: {
    getUserByReplitId: jest.fn(),
    getUserRoles: jest.fn(),
    hasPermission: jest.fn(),
    getUserProfile: jest.fn(),
  }
}));

// Import after mocking
import { storage } from '../../../server/storage';

describe('Authorization Tests', () => {
  let app: express.Application;
  let normalUser: any;
  let adminUser: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    // Mock session
    app.use((req: any, res, next) => {
      req.session = { csrfToken: 'test-csrf-token' };
      req.isAuthenticated = jest.fn(() => false);
      next();
    });

    const { registerRoutes } = await import('../../../server/routes');
    await registerRoutes(app);

    normalUser = createAuthenticatedUser();
    adminUser = createAdminUser();
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should allow admin access to admin endpoints', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, adminUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(adminUser);
      (storage.getUserRoles as jest.Mock).mockResolvedValue([
        { roleName: 'super_admin', isPlatformRole: true }
      ]);

      const response = await request(app)
        .get('/api/admin/users')
        .set(createAuthHeaders(generateTestToken(adminUser)))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny normal users access to admin endpoints', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, normalUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(normalUser);
      (storage.getUserRoles as jest.Mock).mockResolvedValue([
        { roleName: 'user', isPlatformRole: true }
      ]);

      await request(app)
        .get('/api/admin/users')
        .set(createAuthHeaders(generateTestToken(normalUser)))
        .expect(403);
    });

    it('should check multiple roles correctly', async () => {
      const multiRoleUser = {
        ...normalUser,
        roles: ['dancer', 'organizer', 'teacher']
      };

      app.use((req: any, res, next) => {
        mockAuthenticated(req, multiRoleUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(multiRoleUser);
      (storage.getUserRoles as jest.Mock).mockResolvedValue([
        { roleName: 'dancer', isPlatformRole: false },
        { roleName: 'organizer', isPlatformRole: false },
        { roleName: 'teacher', isPlatformRole: false }
      ]);

      // Should have access to organizer features
      const response = await request(app)
        .post('/api/events/create')
        .set(createAuthHeaders(generateTestToken(multiRoleUser)))
        .send({
          title: 'Test Event',
          startDate: new Date().toISOString(),
          location: 'Test Location'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Permission-Based Access Control', () => {
    it('should allow users with specific permissions', async () => {
      const userWithPermissions = {
        ...normalUser,
        permissions: {
          canCreateEvents: true,
          canModerateContent: true
        }
      };

      app.use((req: any, res, next) => {
        mockAuthenticated(req, userWithPermissions);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(userWithPermissions);
      (storage.hasPermission as jest.Mock).mockImplementation(
        (userId: number, permission: string) => {
          return userWithPermissions.permissions[permission] || false;
        }
      );

      const response = await request(app)
        .post('/api/events/create')
        .set(createAuthHeaders(generateTestToken(userWithPermissions)))
        .send({
          title: 'Permission Test Event',
          startDate: new Date().toISOString()
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should deny users without required permissions', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, normalUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(normalUser);
      (storage.hasPermission as jest.Mock).mockResolvedValue(false);

      await request(app)
        .delete('/api/posts/123')
        .set(createAuthHeaders(generateTestToken(normalUser)))
        .expect(403);
    });
  });

  describe('Resource-Based Access Control', () => {
    it('should allow users to modify their own resources', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, normalUser);
        next();
      });

      const userPost = {
        id: 1,
        userId: normalUser.id,
        content: 'Test post'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(normalUser);
      (storage.getPost as jest.Mock).mockResolvedValue(userPost);
      (storage.updatePost as jest.Mock).mockResolvedValue({ ...userPost, content: 'Updated' });

      const response = await request(app)
        .put('/api/posts/1')
        .set(createAuthHeaders(generateTestToken(normalUser)))
        .send({ content: 'Updated content' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny users from modifying others resources', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, normalUser);
        next();
      });

      const otherUserPost = {
        id: 1,
        userId: 999, // Different user
        content: 'Someone else post'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(normalUser);
      (storage.getPost as jest.Mock).mockResolvedValue(otherUserPost);

      await request(app)
        .put('/api/posts/1')
        .set(createAuthHeaders(generateTestToken(normalUser)))
        .send({ content: 'Trying to update' })
        .expect(403);
    });

    it('should allow admins to modify any resource', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, adminUser);
        next();
      });

      const anyPost = {
        id: 1,
        userId: 999,
        content: 'Any user post'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(adminUser);
      (storage.getUserRoles as jest.Mock).mockResolvedValue([
        { roleName: 'super_admin', isPlatformRole: true }
      ]);
      (storage.getPost as jest.Mock).mockResolvedValue(anyPost);
      (storage.updatePost as jest.Mock).mockResolvedValue({ ...anyPost, content: 'Admin updated' });

      const response = await request(app)
        .put('/api/posts/1')
        .set(createAuthHeaders(generateTestToken(adminUser)))
        .send({ content: 'Admin update' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Group-Based Access Control', () => {
    it('should allow group members to access group content', async () => {
      const groupMember = {
        ...normalUser,
        groups: [1, 2, 3]
      };

      app.use((req: any, res, next) => {
        mockAuthenticated(req, groupMember);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(groupMember);
      (storage.isGroupMember as jest.Mock).mockResolvedValue(true);
      (storage.getGroupPosts as jest.Mock).mockResolvedValue([
        { id: 1, content: 'Group post 1' },
        { id: 2, content: 'Group post 2' }
      ]);

      const response = await request(app)
        .get('/api/groups/1/posts')
        .set(createAuthHeaders(generateTestToken(groupMember)))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should deny non-members access to private group content', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, normalUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(normalUser);
      (storage.isGroupMember as jest.Mock).mockResolvedValue(false);
      (storage.getGroup as jest.Mock).mockResolvedValue({
        id: 1,
        isPrivate: true
      });

      await request(app)
        .get('/api/groups/1/posts')
        .set(createAuthHeaders(generateTestToken(normalUser)))
        .expect(403);
    });
  });

  describe('Time-Based Access Control', () => {
    it('should allow access during valid time windows', async () => {
      const eventWithTimeRestriction = {
        id: 1,
        startDate: new Date(Date.now() - 3600000), // Started 1 hour ago
        endDate: new Date(Date.now() + 3600000), // Ends in 1 hour
        requiresActiveAccess: true
      };

      app.use((req: any, res, next) => {
        mockAuthenticated(req, normalUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(normalUser);
      (storage.getEvent as jest.Mock).mockResolvedValue(eventWithTimeRestriction);
      (storage.isEventParticipant as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .get('/api/events/1/live-content')
        .set(createAuthHeaders(generateTestToken(normalUser)))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny access outside time windows', async () => {
      const expiredEvent = {
        id: 1,
        startDate: new Date(Date.now() - 7200000), // 2 hours ago
        endDate: new Date(Date.now() - 3600000), // Ended 1 hour ago
        requiresActiveAccess: true
      };

      app.use((req: any, res, next) => {
        mockAuthenticated(req, normalUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(normalUser);
      (storage.getEvent as jest.Mock).mockResolvedValue(expiredEvent);

      await request(app)
        .get('/api/events/1/live-content')
        .set(createAuthHeaders(generateTestToken(normalUser)))
        .expect(403);
    });
  });

  describe('Conditional Access Control', () => {
    it('should enforce subscription requirements', async () => {
      const premiumContent = {
        id: 1,
        requiresSubscription: true,
        subscriptionTier: 'professional'
      };

      const subscribedUser = {
        ...normalUser,
        subscriptionTier: 'professional',
        subscriptionStatus: 'active'
      };

      app.use((req: any, res, next) => {
        mockAuthenticated(req, subscribedUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(subscribedUser);
      (storage.getContent as jest.Mock).mockResolvedValue(premiumContent);

      const response = await request(app)
        .get('/api/premium-content/1')
        .set(createAuthHeaders(generateTestToken(subscribedUser)))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny access without required subscription', async () => {
      const premiumContent = {
        id: 1,
        requiresSubscription: true,
        subscriptionTier: 'professional'
      };

      app.use((req: any, res, next) => {
        mockAuthenticated(req, normalUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(normalUser);
      (storage.getContent as jest.Mock).mockResolvedValue(premiumContent);

      await request(app)
        .get('/api/premium-content/1')
        .set(createAuthHeaders(generateTestToken(normalUser)))
        .expect(403);
    });

    it('should enforce age restrictions', async () => {
      const ageRestrictedEvent = {
        id: 1,
        ageRestriction: 21
      };

      const underageUser = {
        ...normalUser,
        birthDate: new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000) // 18 years old
      };

      app.use((req: any, res, next) => {
        mockAuthenticated(req, underageUser);
        next();
      });

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(underageUser);
      (storage.getEvent as jest.Mock).mockResolvedValue(ageRestrictedEvent);

      await request(app)
        .post('/api/events/1/register')
        .set(createAuthHeaders(generateTestToken(underageUser)))
        .expect(403);
    });
  });
});