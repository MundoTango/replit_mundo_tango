import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { createAuthenticatedUser } from '../../factories/userFactory';
import { createAuthHeaders, generateTestToken, mockAuthenticated } from '../../helpers/auth';

// Mock storage
jest.mock('../../../server/storage', () => ({
  storage: {
    createEvent: jest.fn(),
    getEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    getEvents: jest.fn(),
    getUpcomingEvents: jest.fn(),
    rsvpToEvent: jest.fn(),
    cancelRsvp: jest.fn(),
    getEventRsvp: jest.fn(),
    getEventAttendees: jest.fn(),
    getUserByReplitId: jest.fn(),
    isEventOrganizer: jest.fn(),
    getEventsByCity: jest.fn(),
    getEventsByOrganizer: jest.fn(),
  }
}));

import { storage } from '../../../server/storage';

describe('Events API Tests', () => {
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

  describe('POST /api/events', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should create a new event', async () => {
      const eventData = {
        title: 'Milonga at Salon Canning',
        description: 'Traditional milonga with live orchestra',
        eventType: 'milonga',
        startDate: '2025-09-01T20:00:00Z',
        endDate: '2025-09-02T02:00:00Z',
        location: 'Salon Canning',
        address: 'Av. Scalabrini Ortiz 1331',
        city: 'Buenos Aires',
        country: 'Argentina',
        price: '500',
        currency: 'ARS',
        maxAttendees: 200
      };

      const createdEvent = {
        id: 1,
        userId: mockUser.id,
        ...eventData,
        currentAttendees: 0,
        status: 'active',
        createdAt: new Date()
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.createEvent as jest.Mock).mockResolvedValue(createdEvent);

      const response = await request(app)
        .post('/api/events')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(eventData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        event: expect.objectContaining({
          title: eventData.title,
          eventType: 'milonga'
        })
      });

      expect(storage.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          title: eventData.title
        })
      );
    });

    it('should validate required fields', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/events')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Title is required');
    });

    it('should validate event dates', async () => {
      const invalidEvent = {
        title: 'Test Event',
        startDate: '2025-09-02T20:00:00Z',
        endDate: '2025-09-01T20:00:00Z' // End before start
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/events')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(invalidEvent)
        .expect(400);

      expect(response.body.message).toContain('End date must be after start date');
    });

    it('should create recurring events', async () => {
      const recurringEvent = {
        title: 'Weekly Practica',
        eventType: 'practica',
        startDate: '2025-09-01T19:00:00Z',
        endDate: '2025-09-01T22:00:00Z',
        location: 'Dance Studio',
        city: 'Buenos Aires',
        isRecurring: true,
        recurringPattern: 'weekly',
        recurringEndDate: '2025-12-31'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.createEvent as jest.Mock).mockResolvedValue({
        ...recurringEvent,
        id: 1,
        seriesId: 1
      });

      const response = await request(app)
        .post('/api/events')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(recurringEvent)
        .expect(201);

      expect(response.body.event).toMatchObject({
        isRecurring: true,
        recurringPattern: 'weekly'
      });
    });
  });

  describe('GET /api/events/:id', () => {
    it('should get event details', async () => {
      const event = {
        id: 1,
        title: 'Test Milonga',
        description: 'Test event',
        eventType: 'milonga',
        startDate: new Date('2025-09-01T20:00:00Z'),
        location: 'Test Venue',
        organizer: {
          id: 1,
          name: 'Organizer',
          username: 'organizer1'
        },
        currentAttendees: 45,
        maxAttendees: 100
      };

      (storage.getEvent as jest.Mock).mockResolvedValue(event);

      const response = await request(app)
        .get('/api/events/1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        event: expect.objectContaining({
          title: event.title,
          currentAttendees: 45
        })
      });
    });

    it('should return 404 for non-existent event', async () => {
      (storage.getEvent as jest.Mock).mockResolvedValue(null);

      await request(app)
        .get('/api/events/999')
        .expect(404);
    });

    it('should include RSVP status for authenticated users', async () => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });

      const event = { id: 1, title: 'Test Event' };
      const rsvp = { status: 'going', createdAt: new Date() };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getEvent as jest.Mock).mockResolvedValue(event);
      (storage.getEventRsvp as jest.Mock).mockResolvedValue(rsvp);

      const response = await request(app)
        .get('/api/events/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body.event.userRsvp).toMatchObject({
        status: 'going'
      });
    });
  });

  describe('PUT /api/events/:id', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should allow organizer to update event', async () => {
      const event = {
        id: 1,
        userId: mockUser.id,
        title: 'Original Title'
      };

      const updates = {
        title: 'Updated Title',
        description: 'Updated description',
        maxAttendees: 150
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getEvent as jest.Mock).mockResolvedValue(event);
      (storage.isEventOrganizer as jest.Mock).mockResolvedValue(true);
      (storage.updateEvent as jest.Mock).mockResolvedValue({
        ...event,
        ...updates
      });

      const response = await request(app)
        .put('/api/events/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(updates)
        .expect(200);

      expect(response.body.event).toMatchObject(updates);
    });

    it('should deny non-organizer updates', async () => {
      const event = {
        id: 1,
        userId: 999 // Different user
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getEvent as jest.Mock).mockResolvedValue(event);
      (storage.isEventOrganizer as jest.Mock).mockResolvedValue(false);

      await request(app)
        .put('/api/events/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({ title: 'Trying to update' })
        .expect(403);
    });

    it('should allow cancelling event', async () => {
      const event = {
        id: 1,
        userId: mockUser.id,
        status: 'active'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getEvent as jest.Mock).mockResolvedValue(event);
      (storage.isEventOrganizer as jest.Mock).mockResolvedValue(true);
      (storage.updateEvent as jest.Mock).mockResolvedValue({
        ...event,
        status: 'cancelled'
      });

      const response = await request(app)
        .put('/api/events/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({ status: 'cancelled' })
        .expect(200);

      expect(response.body.event.status).toBe('cancelled');
    });
  });

  describe('DELETE /api/events/:id', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should allow organizer to delete event', async () => {
      const event = {
        id: 1,
        userId: mockUser.id
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getEvent as jest.Mock).mockResolvedValue(event);
      (storage.isEventOrganizer as jest.Mock).mockResolvedValue(true);
      (storage.deleteEvent as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/events/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Event deleted successfully'
      });

      expect(storage.deleteEvent).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /api/events/:id/rsvp', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should RSVP to event', async () => {
      const event = {
        id: 1,
        currentAttendees: 50,
        maxAttendees: 100
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getEvent as jest.Mock).mockResolvedValue(event);
      (storage.getEventRsvp as jest.Mock).mockResolvedValue(null);
      (storage.rsvpToEvent as jest.Mock).mockResolvedValue({
        eventId: 1,
        userId: mockUser.id,
        status: 'going'
      });

      const response = await request(app)
        .post('/api/events/1/rsvp')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({ status: 'going' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'RSVP successful'
      });

      expect(storage.rsvpToEvent).toHaveBeenCalledWith(1, mockUser.id, 'going');
    });

    it('should update existing RSVP', async () => {
      const existingRsvp = {
        eventId: 1,
        userId: mockUser.id,
        status: 'maybe'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getEvent as jest.Mock).mockResolvedValue({ id: 1 });
      (storage.getEventRsvp as jest.Mock).mockResolvedValue(existingRsvp);
      (storage.rsvpToEvent as jest.Mock).mockResolvedValue({
        ...existingRsvp,
        status: 'going'
      });

      const response = await request(app)
        .post('/api/events/1/rsvp')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({ status: 'going' })
        .expect(200);

      expect(response.body.message).toContain('RSVP updated');
    });

    it('should prevent RSVP to full event', async () => {
      const fullEvent = {
        id: 1,
        currentAttendees: 100,
        maxAttendees: 100
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getEvent as jest.Mock).mockResolvedValue(fullEvent);
      (storage.getEventRsvp as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/events/1/rsvp')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({ status: 'going' })
        .expect(400);

      expect(response.body.message).toContain('Event is full');
    });

    it('should validate RSVP status', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getEvent as jest.Mock).mockResolvedValue({ id: 1 });

      const response = await request(app)
        .post('/api/events/1/rsvp')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.message).toContain('Invalid RSVP status');
    });
  });

  describe('DELETE /api/events/:id/rsvp', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should cancel RSVP', async () => {
      const rsvp = {
        eventId: 1,
        userId: mockUser.id,
        status: 'going'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getEvent as jest.Mock).mockResolvedValue({ id: 1 });
      (storage.getEventRsvp as jest.Mock).mockResolvedValue(rsvp);
      (storage.cancelRsvp as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/events/1/rsvp')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'RSVP cancelled'
      });
    });
  });

  describe('GET /api/events/:id/attendees', () => {
    it('should list event attendees', async () => {
      const attendees = [
        { id: 1, name: 'Attendee 1', status: 'going' },
        { id: 2, name: 'Attendee 2', status: 'going' }
      ];

      (storage.getEvent as jest.Mock).mockResolvedValue({ id: 1 });
      (storage.getEventAttendees as jest.Mock).mockResolvedValue(attendees);

      const response = await request(app)
        .get('/api/events/1/attendees')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        attendees: expect.arrayContaining([
          expect.objectContaining({ status: 'going' })
        ])
      });
    });

    it('should filter attendees by status', async () => {
      const goingAttendees = [
        { id: 1, name: 'Going 1', status: 'going' },
        { id: 2, name: 'Going 2', status: 'going' }
      ];

      (storage.getEvent as jest.Mock).mockResolvedValue({ id: 1 });
      (storage.getEventAttendees as jest.Mock).mockResolvedValue(goingAttendees);

      const response = await request(app)
        .get('/api/events/1/attendees')
        .query({ status: 'going' })
        .expect(200);

      expect(response.body.attendees).toHaveLength(2);
      expect(response.body.attendees.every((a: any) => a.status === 'going')).toBe(true);
    });
  });

  describe('GET /api/events', () => {
    it('should list upcoming events', async () => {
      const upcomingEvents = [
        {
          id: 1,
          title: 'Milonga Tonight',
          startDate: new Date('2025-09-01T20:00:00Z')
        },
        {
          id: 2,
          title: 'Workshop Tomorrow',
          startDate: new Date('2025-09-02T18:00:00Z')
        }
      ];

      (storage.getUpcomingEvents as jest.Mock).mockResolvedValue(upcomingEvents);

      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          upcoming_events: expect.arrayContaining([
            expect.objectContaining({ title: 'Milonga Tonight' })
          ])
        }
      });
    });

    it('should filter events by city', async () => {
      const cityEvents = [
        { id: 1, title: 'BA Event 1', city: 'Buenos Aires' },
        { id: 2, title: 'BA Event 2', city: 'Buenos Aires' }
      ];

      (storage.getEventsByCity as jest.Mock).mockResolvedValue(cityEvents);

      const response = await request(app)
        .get('/api/events')
        .query({ city: 'Buenos Aires' })
        .expect(200);

      expect(storage.getEventsByCity).toHaveBeenCalledWith('Buenos Aires', expect.any(Object));
    });

    it('should filter events by type', async () => {
      const milongas = [
        { id: 1, title: 'Milonga 1', eventType: 'milonga' },
        { id: 2, title: 'Milonga 2', eventType: 'milonga' }
      ];

      (storage.getEvents as jest.Mock).mockResolvedValue(milongas);

      const response = await request(app)
        .get('/api/events')
        .query({ eventType: 'milonga' })
        .expect(200);

      expect(response.body.data.upcoming_events.every((e: any) => e.eventType === 'milonga')).toBe(true);
    });

    it('should filter events by date range', async () => {
      const dateRangeEvents = [
        { id: 1, title: 'Event in Range', startDate: new Date('2025-09-15') }
      ];

      (storage.getEvents as jest.Mock).mockResolvedValue(dateRangeEvents);

      const response = await request(app)
        .get('/api/events')
        .query({
          startDate: '2025-09-01',
          endDate: '2025-09-30'
        })
        .expect(200);

      expect(response.body.data.upcoming_events).toHaveLength(1);
    });
  });

  describe('GET /api/events/my-events', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should list user organized events', async () => {
      const myEvents = [
        { id: 1, title: 'My Event 1', userId: mockUser.id },
        { id: 2, title: 'My Event 2', userId: mockUser.id }
      ];

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getEventsByOrganizer as jest.Mock).mockResolvedValue(myEvents);

      const response = await request(app)
        .get('/api/events/my-events')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        events: expect.arrayContaining([
          expect.objectContaining({ userId: mockUser.id })
        ])
      });
    });
  });
});