import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { createTestUser, createAuthenticatedUser } from '../../factories/userFactory';
import { createAuthHeaders, generateTestToken, mockAuthenticated } from '../../helpers/auth';

// Mock storage
jest.mock('../../../server/storage', () => ({
  storage: {
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByUsername: jest.fn(),
    getUserById: jest.fn(),
    getUserByReplitId: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    searchUsers: jest.fn(),
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    getUserStats: jest.fn(),
  }
}));

import { storage } from '../../../server/storage';

describe('User Management Tests', () => {
  let app: express.Application;
  let mockUser: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    app.use((req: any, res, next) => {
      req.session = { csrfToken: 'test-csrf-token' };
      req.isAuthenticated = jest.fn(() => false);
      next();
    });

    const { registerRoutes } = await import('../../../server/routes');
    await registerRoutes(app);

    mockUser = createAuthenticatedUser();
  });

  describe('User Registration', () => {
    it('should successfully register a new user', async () => {
      const newUser = createTestUser();
      const registrationData = {
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        password: 'StrongPassword123!',
        country: newUser.country,
        city: newUser.city,
        tangoRoles: ['dancer', 'follower'],
        languages: ['english']
      };

      (storage.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (storage.getUserByUsername as jest.Mock).mockResolvedValue(null);
      (storage.createUser as jest.Mock).mockResolvedValue({
        id: 1,
        ...registrationData,
        password: 'hashed_password'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(registrationData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Registration successful',
        user: expect.objectContaining({
          email: registrationData.email,
          username: registrationData.username
        })
      });

      expect(storage.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registrationData.email,
          username: registrationData.username,
          password: expect.not.stringMatching('StrongPassword123!')
        })
      );
    });

    it('should reject duplicate email', async () => {
      (storage.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          username: 'newuser',
          email: mockUser.email,
          password: 'Password123!'
        })
        .expect(409);

      expect(response.body.message).toContain('Email already registered');
    });

    it('should reject duplicate username', async () => {
      (storage.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (storage.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          username: mockUser.username,
          email: 'new@example.com',
          password: 'Password123!'
        })
        .expect(409);

      expect(response.body.message).toContain('Username already taken');
    });

    it('should validate password strength', async () => {
      const weakPasswords = ['123456', 'password', 'abc'];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            username: 'testuser',
            email: 'test@example.com',
            password
          })
          .expect(400);

        expect(response.body.message).toContain('password');
      }
    });
  });

  describe('User Profile Management', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should get user profile', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getUserProfile as jest.Mock).mockResolvedValue({
        ...mockUser,
        roles: ['dancer', 'follower'],
        stats: {
          postsCount: 10,
          followersCount: 50,
          followingCount: 30
        }
      });

      const response = await request(app)
        .get('/api/user/profile')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username
        })
      });
    });

    it('should update user profile', async () => {
      const updates = {
        bio: 'Updated bio',
        city: 'New York',
        tangoRoles: ['leader', 'teacher'],
        languages: ['english', 'spanish']
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.updateUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...updates
      });

      const response = await request(app)
        .put('/api/user/profile')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(updates)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Profile updated successfully'
      });

      expect(storage.updateUser).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining(updates)
      );
    });

    it('should upload profile image', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.updateUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        profileImage: 'https://example.com/profile.jpg'
      });

      // Note: In real tests, you'd use a proper file upload
      const response = await request(app)
        .post('/api/user/profile-image')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .attach('profileImage', Buffer.from('fake-image'), 'profile.jpg')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        imageUrl: expect.any(String)
      });
    });

    it('should delete user account', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.deleteUser as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/user/account')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({ password: 'testPassword123!' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Account deleted successfully'
      });

      expect(storage.deleteUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('User Search and Discovery', () => {
    it('should search users by name', async () => {
      const searchResults = [
        { id: 1, name: 'John Doe', username: 'johndoe' },
        { id: 2, name: 'John Smith', username: 'johnsmith' }
      ];

      (storage.searchUsers as jest.Mock).mockResolvedValue(searchResults);

      const response = await request(app)
        .get('/api/users/search')
        .query({ q: 'John' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        users: searchResults
      });
    });

    it('should filter users by tango role', async () => {
      const leaders = [
        { id: 1, name: 'Leader 1', tangoRoles: ['leader'] },
        { id: 2, name: 'Leader 2', tangoRoles: ['leader', 'teacher'] }
      ];

      (storage.searchUsers as jest.Mock).mockResolvedValue(leaders);

      const response = await request(app)
        .get('/api/users/search')
        .query({ role: 'leader' })
        .expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.users[0].tangoRoles).toContain('leader');
    });

    it('should filter users by location', async () => {
      const locationUsers = [
        { id: 1, name: 'User 1', city: 'Buenos Aires', country: 'Argentina' }
      ];

      (storage.searchUsers as jest.Mock).mockResolvedValue(locationUsers);

      const response = await request(app)
        .get('/api/users/search')
        .query({ city: 'Buenos Aires' })
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].city).toBe('Buenos Aires');
    });
  });

  describe('User Statistics', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should get user statistics', async () => {
      const stats = {
        postsCount: 25,
        followersCount: 100,
        followingCount: 75,
        eventsAttended: 15,
        groupsJoined: 5,
        profileViews: 500
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getUserStats as jest.Mock).mockResolvedValue(stats);

      const response = await request(app)
        .get('/api/user/stats')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        stats
      });
    });

    it('should track profile views', async () => {
      (storage.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (storage.trackProfileView as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/users/1/view')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(storage.trackProfileView).toHaveBeenCalledWith(1, mockUser.id);
    });
  });

  describe('User Preferences', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should update notification preferences', async () => {
      const preferences = {
        emailNotifications: {
          messages: true,
          events: false,
          marketing: false
        },
        pushNotifications: {
          messages: true,
          events: true,
          marketing: false
        }
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.updateUserPreferences as jest.Mock).mockResolvedValue(preferences);

      const response = await request(app)
        .put('/api/user/preferences/notifications')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(preferences)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        preferences
      });
    });

    it('should update privacy settings', async () => {
      const privacySettings = {
        profileVisibility: 'friends',
        showEmail: false,
        showPhone: false,
        allowMessages: 'friends',
        allowEventInvites: true
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.updateUserPrivacy as jest.Mock).mockResolvedValue(privacySettings);

      const response = await request(app)
        .put('/api/user/preferences/privacy')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(privacySettings)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        privacy: privacySettings
      });
    });
  });

  describe('User Validation', () => {
    it('should validate email format', async () => {
      const invalidEmails = ['notanemail', '@example.com', 'test@', 'test@.com'];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            username: 'testuser',
            email,
            password: 'Password123!'
          })
          .expect(400);

        expect(response.body.message).toContain('email');
      }
    });

    it('should validate username format', async () => {
      const invalidUsernames = ['', 'a', 'user name', 'user@name', '123'];

      for (const username of invalidUsernames) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            username,
            email: 'test@example.com',
            password: 'Password123!'
          })
          .expect(400);

        expect(response.body.message).toContain('username');
      }
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });
});