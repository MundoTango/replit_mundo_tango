import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server/index';
import { storage } from '../../server/storage';

describe('Custom Roles API Endpoints', () => {
  // Mock user session
  const mockUserSession = {
    id: 1,
    email: 'testuser@example.com',
    username: 'testuser',
    name: 'Test User'
  };

  // Create a mock session middleware for testing
  beforeEach(() => {
    // Mock the authentication middleware to return our test user
    (app as any).use((req: any, res: any, next: any) => {
      req.user = mockUserSession;
      req.session = { user: mockUserSession };
      next();
    });
  });

  afterEach(() => {
    // Clean up any test data
  });

  describe('POST /api/roles/custom/request', () => {
    it('should create a custom role request successfully', async () => {
      const customRoleData = {
        roleName: 'Tango Shoe Designer',
        roleDescription: 'Designs and creates custom tango shoes for dancers worldwide'
      };

      const response = await request(app)
        .post('/api/roles/custom/request')
        .send(customRoleData)
        .expect(200);

      expect(response.body).toEqual({
        code: 200,
        message: 'Custom role request submitted successfully',
        data: expect.objectContaining({
          id: expect.any(String),
          roleName: customRoleData.roleName,
          roleDescription: customRoleData.roleDescription,
          submittedBy: mockUserSession.id,
          status: 'pending'
        })
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/roles/custom/request')
        .send({})
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.message).toContain('validation');
    });

    it('should validate role name length', async () => {
      const response = await request(app)
        .post('/api/roles/custom/request')
        .send({
          roleName: 'A', // Too short
          roleDescription: 'A valid description that meets minimum requirements'
        })
        .expect(400);

      expect(response.body.code).toBe(400);
    });

    it('should validate role description length', async () => {
      const response = await request(app)
        .post('/api/roles/custom/request')
        .send({
          roleName: 'Valid Role Name',
          roleDescription: 'Too short' // Too short
        })
        .expect(400);

      expect(response.body.code).toBe(400);
    });
  });

  describe('GET /api/roles/custom/my-requests', () => {
    it('should return user custom role requests', async () => {
      // First create a request
      await request(app)
        .post('/api/roles/custom/request')
        .send({
          roleName: 'Test Role',
          roleDescription: 'Test description for getting requests'
        });

      const response = await request(app)
        .get('/api/roles/custom/my-requests')
        .expect(200);

      expect(response.body).toEqual({
        code: 200,
        message: 'User custom role requests retrieved successfully',
        data: expect.objectContaining({
          requests: expect.arrayContaining([
            expect.objectContaining({
              roleName: 'Test Role',
              submittedBy: mockUserSession.id,
              status: 'pending'
            })
          ])
        })
      });
    });

    it('should return empty array for user with no requests', async () => {
      // Mock a different user with no requests
      const response = await request(app)
        .get('/api/roles/custom/my-requests')
        .expect(200);

      expect(response.body.data.requests).toEqual([]);
    });
  });

  describe('GET /api/roles/custom/all (Admin only)', () => {
    it('should return all custom role requests for admins', async () => {
      // Mock admin user
      const adminSession = {
        ...mockUserSession,
        id: 2,
        roles: ['admin']
      };

      // Create some test requests
      await request(app)
        .post('/api/roles/custom/request')
        .send({
          roleName: 'Admin Test Role',
          roleDescription: 'Role for admin testing purposes'
        });

      const response = await request(app)
        .get('/api/roles/custom/all')
        .set('User-Session', JSON.stringify(adminSession))
        .expect(200);

      expect(response.body).toEqual({
        code: 200,
        message: 'All custom role requests retrieved successfully',
        data: expect.objectContaining({
          requests: expect.any(Array)
        })
      });
    });

    it('should deny access to non-admin users', async () => {
      const response = await request(app)
        .get('/api/roles/custom/all')
        .expect(403);

      expect(response.body.code).toBe(403);
      expect(response.body.message).toContain('admin');
    });
  });

  describe('PUT /api/roles/custom/:id/approve (Admin only)', () => {
    it('should approve a custom role request', async () => {
      // First create a request
      const createResponse = await request(app)
        .post('/api/roles/custom/request')
        .send({
          roleName: 'Approval Test Role',
          roleDescription: 'Role for testing approval process'
        });

      const requestId = createResponse.body.data.id;
      const adminSession = {
        ...mockUserSession,
        id: 2,
        roles: ['admin']
      };

      const response = await request(app)
        .put(`/api/roles/custom/${requestId}/approve`)
        .set('User-Session', JSON.stringify(adminSession))
        .send({
          adminNotes: 'Approved for community use'
        })
        .expect(200);

      expect(response.body).toEqual({
        code: 200,
        message: 'Custom role request approved successfully',
        data: expect.objectContaining({
          id: requestId,
          status: 'approved',
          approvedBy: adminSession.id,
          adminNotes: 'Approved for community use'
        })
      });
    });
  });

  describe('PUT /api/roles/custom/:id/reject (Admin only)', () => {
    it('should reject a custom role request', async () => {
      // First create a request
      const createResponse = await request(app)
        .post('/api/roles/custom/request')
        .send({
          roleName: 'Rejection Test Role',
          roleDescription: 'Role for testing rejection process'
        });

      const requestId = createResponse.body.data.id;
      const adminSession = {
        ...mockUserSession,
        id: 2,
        roles: ['admin']
      };

      const response = await request(app)
        .put(`/api/roles/custom/${requestId}/reject`)
        .set('User-Session', JSON.stringify(adminSession))
        .send({
          adminNotes: 'Does not meet community standards'
        })
        .expect(200);

      expect(response.body).toEqual({
        code: 200,
        message: 'Custom role request rejected',
        data: expect.objectContaining({
          id: requestId,
          status: 'rejected',
          rejectedBy: adminSession.id,
          adminNotes: 'Does not meet community standards'
        })
      });
    });
  });

  describe('Role System Integration', () => {
    it('should integrate with existing community roles endpoint', async () => {
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      expect(response.body).toEqual({
        code: 200,
        message: 'Community roles retrieved successfully',
        data: expect.objectContaining({
          roles: expect.arrayContaining([
            expect.objectContaining({
              name: 'other',
              description: 'Request a custom role not listed above'
            })
          ])
        })
      });

      // Should return 19 roles (18 predefined + "other")
      expect(response.body.data.roles).toHaveLength(19);
    });

    it('should handle performance under load', async () => {
      const startTime = Date.now();
      
      // Create multiple concurrent requests
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/roles/custom/request')
          .send({
            roleName: `Load Test Role ${i}`,
            roleDescription: `Description for load test role number ${i}`
          })
      );

      await Promise.all(requests);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete within reasonable time (less than 2 seconds)
      expect(totalTime).toBeLessThan(2000);
    });
  });

  describe('Data Validation and Security', () => {
    it('should sanitize input data', async () => {
      const maliciousData = {
        roleName: '<script>alert("xss")</script>Tango Teacher',
        roleDescription: 'SELECT * FROM users; DROP TABLE roles; -- injection attempt'
      };

      const response = await request(app)
        .post('/api/roles/custom/request')
        .send(maliciousData)
        .expect(200);

      // Should sanitize the input
      expect(response.body.data.roleName).not.toContain('<script>');
      expect(response.body.data.roleDescription).not.toContain('DROP TABLE');
    });

    it('should enforce rate limiting', async () => {
      // Rapid fire requests to test rate limiting
      const requests = Array.from({ length: 20 }, () =>
        request(app)
          .post('/api/roles/custom/request')
          .send({
            roleName: 'Rate Limit Test',
            roleDescription: 'Testing rate limiting functionality'
          })
      );

      const responses = await Promise.allSettled(requests);
      const rejectedRequests = responses.filter(r => 
        r.status === 'fulfilled' && (r.value as any).status === 429
      );

      // Should have some rate-limited requests
      expect(rejectedRequests.length).toBeGreaterThan(0);
    });
  });
});