import request from 'supertest';
import { Express } from 'express';
import { registerRoutes } from '../../server/routes';

describe('Roles API Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    const express = require('express');
    app = express();
    app.use(express.json());
    await registerRoutes(app);
  });

  describe('GET /api/roles/community', () => {
    it('should return community roles without authentication', async () => {
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

      // Validate that we have the expected roles including new guide role
      const roles = response.body.data.roles;
      expect(roles.length).toBeGreaterThan(15);
      
      // Check for critical roles
      const roleNames = roles.map((role: any) => role.name);
      expect(roleNames).toContain('dancer');
      expect(roleNames).toContain('teacher');
      expect(roleNames).toContain('host');
      expect(roleNames).toContain('guide');
      expect(roleNames).toContain('organizer');
      expect(roleNames).toContain('dj');

      // Validate updated descriptions
      const hostRole = roles.find((role: any) => role.name === 'host');
      const guideRole = roles.find((role: any) => role.name === 'guide');
      
      expect(hostRole.description).toBe('Offers a home to travelers');
      expect(guideRole.description).toBe('Willing to show visitors around');

      // Validate role object structure
      roles.forEach((role: any) => {
        expect(role).toHaveProperty('name');
        expect(role).toHaveProperty('description');
        expect(typeof role.name).toBe('string');
        expect(typeof role.description).toBe('string');
        expect(role.name).toBeTruthy();
        expect(role.description).toBeTruthy();
      });
    });

    it('should be accessible without authentication middleware blocking', async () => {
      // This endpoint should be accessible during onboarding
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      expect(response.body.code).toBe(200);
    });

    it('should handle errors gracefully', async () => {
      // Test with invalid endpoint to ensure proper error handling
      const response = await request(app)
        .get('/api/roles/nonexistent')
        .expect(404);
    });

    it('should return roles in consistent format', async () => {
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      const roles = response.body.data.roles;
      
      // Ensure all roles follow consistent naming convention
      roles.forEach((role: any) => {
        expect(role.name).toMatch(/^[a-z_]+$/);
        expect(role.description).toMatch(/^[A-Z]/); // Starts with capital letter
      });
    });

    it('should return roles sorted alphabetically', async () => {
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      const roles = response.body.data.roles;
      const roleNames = roles.map((role: any) => role.name);
      const sortedNames = [...roleNames].sort();
      
      expect(roleNames).toEqual(sortedNames);
    });
  });

  describe('Role Data Validation', () => {
    it('should validate that all roles are community roles (not platform roles)', async () => {
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      const roles = response.body.data.roles;
      
      // Platform roles should not be included
      const platformRoles = ['admin', 'super_admin', 'moderator', 'curator', 'guest', 'bot'];
      const roleNames = roles.map((role: any) => role.name);
      
      platformRoles.forEach(platformRole => {
        expect(roleNames).not.toContain(platformRole);
      });
    });

    it('should ensure role descriptions are descriptive and helpful', async () => {
      const response = await request(app)
        .get('/api/roles/community')
        .expect(200);

      const roles = response.body.data.roles;
      
      roles.forEach((role: any) => {
        expect(role.description.length).toBeGreaterThan(10);
        expect(role.description).not.toMatch(/^TODO/i);
        expect(role.description).not.toMatch(/placeholder/i);
      });
    });
  });
});