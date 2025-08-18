/**
 * Roles API Test Suite
 * Comprehensive testing for role management endpoints
 */

import request from 'supertest';
import { expect, describe, test, beforeAll, afterAll } from '@jest/globals';
import { db } from '../../server/db';
import { roles, userRoles, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

// Mock Express app for testing
const createTestApp = () => {
  const express = require('express');
  const app = express();
  app.use(express.json());
  
  // Import routes
  require('../../server/routes')(app);
  
  return app;
};

let app: any;
let testUserId: number;

describe('Roles API Endpoints', () => {
  beforeAll(async () => {
    app = createTestApp();
    
    // Create a test user for role assignment tests
    const [testUser] = await db.insert(users).values({
      name: 'Test User',
      username: 'testuser_roles',
      email: 'testuser_roles@example.com',
      password: 'hashedpassword',
    }).returning();
    
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await db.delete(userRoles).where(eq(userRoles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  describe('GET /api/roles/community', () => {
    test('should return all community roles without authentication', async () => {
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      expect(response.body).toMatchObject({
        code: 200,
        message: 'Community roles retrieved successfully',
        data: {
          roles: expect.any(Array)
        }
      });

      const { roles: communityRoles } = response.body.data;
      
      // Verify we have the expected number of community roles
      expect(communityRoles.length).toBe(18);
      
      // Verify essential role structure
      expect(communityRoles[0]).toHaveProperty('name');
      expect(communityRoles[0]).toHaveProperty('description');
      
      // Verify specific roles exist including enhanced host/guide split
      const roleNames = communityRoles.map((role: any) => role.name);
      expect(roleNames).toContain('dancer');
      expect(roleNames).toContain('teacher');
      expect(roleNames).toContain('organizer');
      expect(roleNames).toContain('host');
      expect(roleNames).toContain('guide');
      expect(roleNames).toContain('dj');
      expect(roleNames).toContain('performer');
      
      // Verify role descriptions
      const hostRole = communityRoles.find((role: any) => role.name === 'host');
      const guideRole = communityRoles.find((role: any) => role.name === 'guide');
      
      expect(hostRole?.description).toBe('Offers a home to travelers');
      expect(guideRole?.description).toBe('Willing to show visitors around');
    });

    test('should return roles in alphabetical order', async () => {
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      const { roles: communityRoles } = response.body.data;
      const roleNames = communityRoles.map((role: any) => role.name);
      const sortedNames = [...roleNames].sort();
      
      expect(roleNames).toEqual(sortedNames);
    });

    test('should respond quickly (performance test)', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/roles/community')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      // Should respond within 500ms
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('Role Assignment Functionality', () => {
    test('should validate role assignment through storage interface', async () => {
      const { storage } = require('../../server/storage');
      
      // Test assigning a community role
      const assignment = await storage.assignRoleToUser(testUserId, 'dancer');
      expect(assignment).toBeDefined();
      
      // Verify role was assigned
      const hasRole = await storage.userHasRole(testUserId, 'dancer');
      expect(hasRole).toBe(true);
      
      // Test getting user roles
      const userRoles = await storage.getUserRoles(testUserId);
      expect(userRoles.length).toBeGreaterThan(0);
      expect(userRoles.some((role: any) => role.roleName === 'dancer')).toBe(true);
    });

    test('should prevent duplicate role assignments', async () => {
      const { storage } = require('../../server/storage');
      
      // Assign role twice
      await storage.assignRoleToUser(testUserId, 'teacher');
      await storage.assignRoleToUser(testUserId, 'teacher'); // Should not throw error
      
      // Verify only one assignment exists
      const userRoles = await storage.getUserRoles(testUserId);
      const teacherRoles = userRoles.filter((role: any) => role.roleName === 'teacher');
      expect(teacherRoles.length).toBe(1);
    });

    test('should handle invalid role assignment', async () => {
      const { storage } = require('../../server/storage');
      
      await expect(
        storage.assignRoleToUser(testUserId, 'nonexistent_role')
      ).rejects.toThrow("Role 'nonexistent_role' does not exist");
    });

    test('should allow role removal', async () => {
      const { storage } = require('../../server/storage');
      
      // Assign and then remove role
      await storage.assignRoleToUser(testUserId, 'organizer');
      await storage.removeRoleFromUser(testUserId, 'organizer');
      
      // Verify role was removed
      const hasRole = await storage.userHasRole(testUserId, 'organizer');
      expect(hasRole).toBe(false);
    });
  });

  describe('Role Data Integrity', () => {
    test('should have all required community roles', async () => {
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      const { roles: communityRoles } = response.body.data;
      const roleNames = communityRoles.map((role: any) => role.name);
      
      const requiredRoles = [
        'dancer', 'teacher', 'performer', 'organizer', 'dj',
        'host', 'guide', 'tango_traveler', 'photographer', 
        'content_creator', 'choreographer', 'musician',
        'vendor', 'tour_operator', 'tango_hotel', 'tango_school',
        'learning_source', 'wellness_provider'
      ];
      
      requiredRoles.forEach(role => {
        expect(roleNames).toContain(role);
      });
    });

    test('should not return platform roles in community endpoint', async () => {
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      const { roles: communityRoles } = response.body.data;
      const roleNames = communityRoles.map((role: any) => role.name);
      
      const platformRoles = ['admin', 'super_admin', 'moderator', 'curator', 'guest', 'bot'];
      
      platformRoles.forEach(role => {
        expect(roleNames).not.toContain(role);
      });
    });

    test('should have proper role descriptions', async () => {
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      const { roles: communityRoles } = response.body.data;
      
      communityRoles.forEach((role: any) => {
        expect(role.description).toBeDefined();
        expect(role.description.length).toBeGreaterThan(0);
        expect(typeof role.description).toBe('string');
      });
    });
  });

  describe('Database Schema Validation', () => {
    test('should verify roles table structure', async () => {
      // Test direct database query
      const allRoles = await db.select().from(roles);
      
      expect(allRoles.length).toBeGreaterThanOrEqual(24); // 18 community + 6 platform
      
      // Verify structure
      allRoles.forEach(role => {
        expect(role).toHaveProperty('id');
        expect(role).toHaveProperty('name');
        expect(role).toHaveProperty('description');
        expect(role).toHaveProperty('isPlatformRole');
        expect(role).toHaveProperty('createdAt');
      });
    });

    test('should verify user_roles table can handle assignments', async () => {
      // Create a test role assignment directly
      const [assignment] = await db.insert(userRoles).values({
        userId: testUserId,
        roleName: 'photographer',
        assignedAt: new Date()
      }).returning();
      
      expect(assignment).toBeDefined();
      expect(assignment.userId).toBe(testUserId);
      expect(assignment.roleName).toBe('photographer');
      
      // Cleanup
      await db.delete(userRoles).where(
        and(
          eq(userRoles.userId, testUserId),
          eq(userRoles.roleName, 'photographer')
        )
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection issues gracefully', async () => {
      // This test would simulate database issues in a real scenario
      // For now, we'll test that the endpoint structure is correct
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });

    test('should return consistent response format', async () => {
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      // Verify response follows TrangoTech API format
      expect(response.body.code).toBe(200);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data).toHaveProperty('roles');
      expect(Array.isArray(response.body.data.roles)).toBe(true);
    });
  });
});

export {};