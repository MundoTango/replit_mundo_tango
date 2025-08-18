import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { createAuthenticatedUser } from '../../factories/userFactory';
import { createAuthHeaders, generateTestToken, mockAuthenticated } from '../../helpers/auth';

// Mock storage
jest.mock('../../../server/storage', () => ({
  storage: {
    createGroup: jest.fn(),
    getGroup: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
    getGroups: jest.fn(),
    joinGroup: jest.fn(),
    leaveGroup: jest.fn(),
    isGroupMember: jest.fn(),
    getGroupMembers: jest.fn(),
    getUserByReplitId: jest.fn(),
    addGroupAdmin: jest.fn(),
    removeGroupAdmin: jest.fn(),
    isGroupAdmin: jest.fn(),
    getGroupsByCity: jest.fn(),
  }
}));

import { storage } from '../../../server/storage';

describe('Groups API Tests', () => {
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

  describe('POST /api/groups', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should create a new group', async () => {
      const groupData = {
        name: 'Buenos Aires Milongueros',
        description: 'A group for tango dancers in Buenos Aires',
        city: 'Buenos Aires',
        country: 'Argentina',
        isPrivate: false,
        category: 'city'
      };

      const createdGroup = {
        id: 1,
        adminId: mockUser.id,
        ...groupData,
        memberCount: 1,
        createdAt: new Date()
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.createGroup as jest.Mock).mockResolvedValue(createdGroup);

      const response = await request(app)
        .post('/api/groups')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(groupData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        group: expect.objectContaining({
          name: groupData.name,
          city: groupData.city
        })
      });

      expect(storage.createGroup).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: mockUser.id,
          name: groupData.name
        })
      );
    });

    it('should validate required fields', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/groups')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Name is required');
    });

    it('should prevent duplicate group names in same city', async () => {
      const groupData = {
        name: 'Existing Group',
        city: 'Buenos Aires',
        country: 'Argentina'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroups as jest.Mock).mockResolvedValue([
        { name: 'Existing Group', city: 'Buenos Aires' }
      ]);

      const response = await request(app)
        .post('/api/groups')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(groupData)
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('GET /api/groups/:id', () => {
    it('should get public group details', async () => {
      const group = {
        id: 1,
        name: 'Test Group',
        description: 'Test description',
        city: 'Buenos Aires',
        isPrivate: false,
        memberCount: 50,
        admin: {
          id: 1,
          name: 'Admin User',
          username: 'admin'
        }
      };

      (storage.getGroup as jest.Mock).mockResolvedValue(group);

      const response = await request(app)
        .get('/api/groups/1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        group: expect.objectContaining({
          name: group.name,
          memberCount: group.memberCount
        })
      });
    });

    it('should restrict private group access to members', async () => {
      const privateGroup = {
        id: 1,
        name: 'Private Group',
        isPrivate: true
      };

      (storage.getGroup as jest.Mock).mockResolvedValue(privateGroup);
      (storage.isGroupMember as jest.Mock).mockResolvedValue(false);

      await request(app)
        .get('/api/groups/1')
        .expect(403);
    });

    it('should allow members to view private groups', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });

      const privateGroup = {
        id: 1,
        name: 'Private Group',
        isPrivate: true
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroup as jest.Mock).mockResolvedValue(privateGroup);
      (storage.isGroupMember as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .get('/api/groups/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body.group.name).toBe('Private Group');
    });
  });

  describe('PUT /api/groups/:id', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should allow admin to update group', async () => {
      const group = {
        id: 1,
        adminId: mockUser.id,
        name: 'Original Name'
      };

      const updates = {
        name: 'Updated Name',
        description: 'Updated description'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroup as jest.Mock).mockResolvedValue(group);
      (storage.isGroupAdmin as jest.Mock).mockResolvedValue(true);
      (storage.updateGroup as jest.Mock).mockResolvedValue({
        ...group,
        ...updates
      });

      const response = await request(app)
        .put('/api/groups/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(updates)
        .expect(200);

      expect(response.body.group).toMatchObject(updates);
    });

    it('should deny non-admin updates', async () => {
      const group = {
        id: 1,
        adminId: 999, // Different user
        name: 'Group'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroup as jest.Mock).mockResolvedValue(group);
      (storage.isGroupAdmin as jest.Mock).mockResolvedValue(false);

      await request(app)
        .put('/api/groups/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({ name: 'Trying to update' })
        .expect(403);
    });
  });

  describe('DELETE /api/groups/:id', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should allow admin to delete group', async () => {
      const group = {
        id: 1,
        adminId: mockUser.id
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroup as jest.Mock).mockResolvedValue(group);
      (storage.isGroupAdmin as jest.Mock).mockResolvedValue(true);
      (storage.deleteGroup as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/groups/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Group deleted successfully'
      });

      expect(storage.deleteGroup).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /api/groups/:id/join', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should allow user to join public group', async () => {
      const group = {
        id: 1,
        isPrivate: false
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroup as jest.Mock).mockResolvedValue(group);
      (storage.isGroupMember as jest.Mock).mockResolvedValue(false);
      (storage.joinGroup as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/groups/1/join')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Successfully joined group'
      });

      expect(storage.joinGroup).toHaveBeenCalledWith(1, mockUser.id);
    });

    it('should prevent joining already joined group', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroup as jest.Mock).mockResolvedValue({ id: 1 });
      (storage.isGroupMember as jest.Mock).mockResolvedValue(true);

      await request(app)
        .post('/api/groups/1/join')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(400);
    });

    it('should require approval for private groups', async () => {
      const privateGroup = {
        id: 1,
        isPrivate: true,
        requiresApproval: true
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroup as jest.Mock).mockResolvedValue(privateGroup);
      (storage.isGroupMember as jest.Mock).mockResolvedValue(false);
      (storage.createJoinRequest as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/groups/1/join')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body.message).toContain('Join request sent');
    });
  });

  describe('POST /api/groups/:id/leave', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should allow member to leave group', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroup as jest.Mock).mockResolvedValue({ id: 1 });
      (storage.isGroupMember as jest.Mock).mockResolvedValue(true);
      (storage.leaveGroup as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/groups/1/leave')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Successfully left group'
      });
    });

    it('should prevent admin from leaving own group', async () => {
      const group = {
        id: 1,
        adminId: mockUser.id
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroup as jest.Mock).mockResolvedValue(group);
      (storage.isGroupMember as jest.Mock).mockResolvedValue(true);
      (storage.isGroupAdmin as jest.Mock).mockResolvedValue(true);

      await request(app)
        .post('/api/groups/1/leave')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(400);
    });
  });

  describe('GET /api/groups/:id/members', () => {
    it('should list group members', async () => {
      const members = [
        { id: 1, name: 'Member 1', joinedAt: new Date() },
        { id: 2, name: 'Member 2', joinedAt: new Date() }
      ];

      (storage.getGroup as jest.Mock).mockResolvedValue({ id: 1, isPrivate: false });
      (storage.getGroupMembers as jest.Mock).mockResolvedValue(members);

      const response = await request(app)
        .get('/api/groups/1/members')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        members: expect.arrayContaining([
          expect.objectContaining({ name: 'Member 1' })
        ])
      });
    });

    it('should paginate members list', async () => {
      const allMembers = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Member ${i + 1}`
      }));

      (storage.getGroup as jest.Mock).mockResolvedValue({ id: 1 });
      (storage.getGroupMembers as jest.Mock).mockImplementation((groupId, limit, offset) => {
        return allMembers.slice(offset, offset + limit);
      });

      const response = await request(app)
        .get('/api/groups/1/members')
        .query({ limit: 10, offset: 20 })
        .expect(200);

      expect(response.body.members).toHaveLength(10);
      expect(response.body.members[0].name).toBe('Member 21');
    });
  });

  describe('GET /api/groups', () => {
    it('should list all public groups', async () => {
      const groups = [
        { id: 1, name: 'Group 1', isPrivate: false },
        { id: 2, name: 'Group 2', isPrivate: false }
      ];

      (storage.getGroups as jest.Mock).mockResolvedValue(groups);

      const response = await request(app)
        .get('/api/groups')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        groups: expect.arrayContaining([
          expect.objectContaining({ name: 'Group 1' })
        ])
      });
    });

    it('should filter groups by city', async () => {
      const cityGroups = [
        { id: 1, name: 'BA Group 1', city: 'Buenos Aires' },
        { id: 2, name: 'BA Group 2', city: 'Buenos Aires' }
      ];

      (storage.getGroupsByCity as jest.Mock).mockResolvedValue(cityGroups);

      const response = await request(app)
        .get('/api/groups')
        .query({ city: 'Buenos Aires' })
        .expect(200);

      expect(storage.getGroupsByCity).toHaveBeenCalledWith('Buenos Aires');
      expect(response.body.groups).toHaveLength(2);
    });

    it('should search groups by name', async () => {
      const searchResults = [
        { id: 1, name: 'Tango Lovers', description: 'For tango enthusiasts' }
      ];

      (storage.getGroups as jest.Mock).mockResolvedValue(searchResults);

      const response = await request(app)
        .get('/api/groups')
        .query({ search: 'tango' })
        .expect(200);

      expect(response.body.groups[0].name).toContain('Tango');
    });
  });

  describe('Group Admin Management', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should add group moderator', async () => {
      const group = { id: 1, adminId: mockUser.id };
      const newModId = 5;

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroup as jest.Mock).mockResolvedValue(group);
      (storage.isGroupAdmin as jest.Mock).mockResolvedValue(true);
      (storage.isGroupMember as jest.Mock).mockResolvedValue(true);
      (storage.addGroupAdmin as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/groups/1/admins')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({ userId: newModId, role: 'moderator' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(storage.addGroupAdmin).toHaveBeenCalledWith(1, newModId, 'moderator');
    });

    it('should remove group moderator', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getGroup as jest.Mock).mockResolvedValue({ id: 1, adminId: mockUser.id });
      (storage.isGroupAdmin as jest.Mock).mockResolvedValue(true);
      (storage.removeGroupAdmin as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/groups/1/admins/5')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(storage.removeGroupAdmin).toHaveBeenCalledWith(1, 5);
    });
  });
});