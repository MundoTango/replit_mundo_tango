import { Router, Request, Response } from 'express';
import { db } from '../db';
import { events, eventAdmins, eventRsvps, users } from '../../shared/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { getUserId } from '../utils/authHelper';
import RRule from 'rrule';
import { emailService } from '../services/emailService';

const router = Router();

// Get all events
router.get('/api/events', async (req: Request, res: Response) => {
  try {
    const allEvents = await db
      .select()
      .from(events);
    
    res.json(allEvents || []);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create recurring events
router.post('/api/events/recurring', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      title,
      description,
      location,
      startDate,
      startTime,
      endTime,
      recurrenceType,
      recurrenceEndDate,
      eventType,
      maxAttendees,
      price,
      isEventPage,
      allowEventPagePosts,
      eventPageAdmins
    } = req.body;

    // Create RRule based on recurrence type
    let freq;
    let interval = 1;
    
    switch (recurrenceType) {
      case 'daily':
        freq = RRule.DAILY;
        break;
      case 'weekly':
        freq = RRule.WEEKLY;
        break;
      case 'biweekly':
        freq = RRule.WEEKLY;
        interval = 2;
        break;
      case 'monthly':
        freq = RRule.MONTHLY;
        break;
      default:
        return res.status(400).json({ error: 'Invalid recurrence type' });
    }

    const rule = new RRule({
      freq,
      interval,
      dtstart: new Date(startDate),
      until: new Date(recurrenceEndDate)
    });

    const dates = rule.all();
    const createdEvents = [];

    // Create each event instance
    for (const date of dates) {
      const eventStart = new Date(date);
      const [hours, minutes] = startTime.split(':');
      eventStart.setHours(parseInt(hours), parseInt(minutes));

      const eventEnd = new Date(date);
      const [endHours, endMinutes] = endTime.split(':');
      eventEnd.setHours(parseInt(endHours), parseInt(endMinutes));

      const [event] = await db.insert(events).values({
        title,
        description,
        location,
        startDate: eventStart,
        endDate: eventEnd,
        eventType,
        maxAttendees,
        price,
        userId,
        isEventPage,
        allowEventPagePosts,
        currentAttendees: 0,
        country: req.user?.country,
        state: req.user?.state,
        city: req.user?.city
      }).returning();

      // Add event owner as admin
      await db.insert(eventAdmins).values({
        eventId: event.id,
        userId,
        role: 'owner',
        permissions: {
          canEditEvent: true,
          canDeleteEvent: true,
          canManageAdmins: true,
          canModerateContent: true,
          canSendNotifications: true
        }
      });

      // Add additional admins if specified
      if (eventPageAdmins && eventPageAdmins.length > 0) {
        for (const adminUserId of eventPageAdmins) {
          await db.insert(eventAdmins).values({
            eventId: event.id,
            userId: adminUserId,
            role: 'admin',
            permissions: {
              canEditEvent: true,
              canDeleteEvent: false,
              canManageAdmins: false,
              canModerateContent: true,
              canSendNotifications: true
            }
          });

          // Send delegation email
          const adminUser = await db.select().from(users).where(eq(users.id, adminUserId)).limit(1);
          if (adminUser[0]) {
            await emailService.sendEventDelegationInvite(event, adminUser[0], 'admin');
          }
        }
      }

      createdEvents.push(event);
    }

    res.json({ 
      success: true, 
      eventsCreated: createdEvents.length,
      events: createdEvents 
    });
  } catch (error: any) {
    console.error('Error creating recurring events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get event admins
router.get('/api/events/:eventId/admins', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const eventId = parseInt(req.params.eventId);

    // Check if user is event owner
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event[0] || event[0].userId !== userId) {
      return res.status(403).json({ error: 'Only event owners can view admins' });
    }

    const admins = await db.select({
      id: eventAdmins.id,
      userId: eventAdmins.userId,
      eventId: eventAdmins.eventId,
      role: eventAdmins.role,
      permissions: eventAdmins.permissions,
      addedAt: eventAdmins.addedAt,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage
      }
    })
    .from(eventAdmins)
    .innerJoin(users, eq(users.id, eventAdmins.userId))
    .where(eq(eventAdmins.eventId, eventId));

    res.json(admins);
  } catch (error: any) {
    console.error('Error fetching event admins:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add event admin
router.post('/api/events/:eventId/admins', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const eventId = parseInt(req.params.eventId);
    const { userId: newAdminId, role } = req.body;

    // Check if user is event owner
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event[0] || event[0].userId !== userId) {
      return res.status(403).json({ error: 'Only event owners can add admins' });
    }

    // Check if admin already exists
    const existingAdmin = await db.select()
      .from(eventAdmins)
      .where(and(
        eq(eventAdmins.eventId, eventId),
        eq(eventAdmins.userId, newAdminId)
      ))
      .limit(1);

    if (existingAdmin[0]) {
      return res.status(400).json({ error: 'User is already an admin for this event' });
    }

    // Add new admin
    const permissions = role === 'admin' ? {
      canEditEvent: true,
      canDeleteEvent: false,
      canManageAdmins: false,
      canModerateContent: true,
      canSendNotifications: true
    } : {
      canEditEvent: false,
      canDeleteEvent: false,
      canManageAdmins: false,
      canModerateContent: true,
      canSendNotifications: false
    };

    const [newAdmin] = await db.insert(eventAdmins).values({
      eventId,
      userId: newAdminId,
      role,
      permissions
    }).returning();

    // Send delegation email
    const adminUser = await db.select().from(users).where(eq(users.id, newAdminId)).limit(1);
    if (adminUser[0]) {
      await emailService.sendEventDelegationInvite(event[0], adminUser[0], role);
    }

    res.json({ success: true, admin: newAdmin });
  } catch (error: any) {
    console.error('Error adding event admin:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove event admin
router.delete('/api/events/:eventId/admins/:adminId', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const eventId = parseInt(req.params.eventId);
    const adminId = parseInt(req.params.adminId);

    // Check if user is event owner
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event[0] || event[0].userId !== userId) {
      return res.status(403).json({ error: 'Only event owners can remove admins' });
    }

    // Cannot remove owner
    const admin = await db.select().from(eventAdmins).where(eq(eventAdmins.id, adminId)).limit(1);
    if (!admin[0] || admin[0].role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove event owner' });
    }

    await db.delete(eventAdmins).where(eq(eventAdmins.id, adminId));

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error removing event admin:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update admin permissions
router.put('/api/events/:eventId/admins/:adminId/permissions', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const eventId = parseInt(req.params.eventId);
    const adminId = parseInt(req.params.adminId);
    const { permissions } = req.body;

    // Check if user is event owner
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event[0] || event[0].userId !== userId) {
      return res.status(403).json({ error: 'Only event owners can update permissions' });
    }

    // Cannot update owner permissions
    const admin = await db.select().from(eventAdmins).where(eq(eventAdmins.id, adminId)).limit(1);
    if (!admin[0] || admin[0].role === 'owner') {
      return res.status(400).json({ error: 'Cannot modify owner permissions' });
    }

    await db.update(eventAdmins)
      .set({ permissions })
      .where(eq(eventAdmins.id, adminId));

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating admin permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's events
router.get('/api/events/my-events', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const myEvents = await db.select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(sql`${events.startDate} DESC`);

    res.json(myEvents);
  } catch (error: any) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;