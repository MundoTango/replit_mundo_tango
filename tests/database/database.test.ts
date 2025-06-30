import { drizzle } from 'drizzle-orm/pg-core';
import { migrate } from 'drizzle-orm/pg-core/migrator';
import { newDb } from 'pg-mem';
import * as schema from '@shared/schema';

describe('Database Tests', () => {
  let memDb: any;
  let db: any;

  beforeAll(async () => {
    // Create in-memory PostgreSQL database
    memDb = newDb();
    
    // Create database connection
    db = drizzle(memDb.adapters.createPg(), { schema });
    
    // Run migrations
    memDb.public.registerFunction({
      name: 'current_user_id',
      returns: 'int',
      implementation: () => 1, // Mock user ID for tests
    });
  });

  beforeEach(async () => {
    // Clean database before each test
    await memDb.public.none(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
    `);
  });

  describe('User Operations', () => {
    it('should create user with proper constraints', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User'
      };

      const [user] = await db.insert(schema.users).values(userData).returning();

      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.id).toBeDefined();
    });

    it('should enforce unique username constraint', async () => {
      const userData = {
        username: 'duplicate',
        email: 'test1@example.com',
        name: 'Test User 1',
        password: 'hashedpassword'
      };

      await db.insert(schema.users).values(userData);

      const duplicateUser = {
        username: 'duplicate',
        email: 'test2@example.com',
        name: 'Test User 2',
        password: 'hashedpassword'
      };

      await expect(
        db.insert(schema.users).values(duplicateUser)
      ).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        name: 'Test User 1',
        password: 'hashedpassword'
      };

      await db.insert(schema.users).values(userData);

      const duplicateUser = {
        username: 'user2',
        email: 'duplicate@example.com',
        name: 'Test User 2',
        password: 'hashedpassword'
      };

      await expect(
        db.insert(schema.users).values(duplicateUser)
      ).rejects.toThrow();
    });
  });

  describe('Posts Operations', () => {
    let userId: number;

    beforeEach(async () => {
      const [user] = await db.insert(schema.users).values({
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword'
      }).returning();
      userId = user.id;
    });

    it('should create post with valid data', async () => {
      const postData = {
        userId,
        content: 'Test post content',
        isPublic: true,
        location: 'Buenos Aires, Argentina'
      };

      const [post] = await db.insert(schema.posts).values(postData).returning();

      expect(post.content).toBe('Test post content');
      expect(post.userId).toBe(userId);
      expect(post.isPublic).toBe(true);
    });

    it('should set default values correctly', async () => {
      const postData = {
        userId,
        content: 'Test post'
      };

      const [post] = await db.insert(schema.posts).values(postData).returning();

      expect(post.isPublic).toBe(true); // Default value
      expect(post.likesCount).toBe(0);
      expect(post.commentsCount).toBe(0);
      expect(post.sharesCount).toBe(0);
    });

    it('should enforce foreign key constraint', async () => {
      const postData = {
        userId: 99999, // Non-existent user
        content: 'Test post content'
      };

      await expect(
        db.insert(schema.posts).values(postData)
      ).rejects.toThrow();
    });
  });

  describe('Events Operations', () => {
    let userId: number;

    beforeEach(async () => {
      const [user] = await db.insert(schema.users).values({
        username: 'organizer',
        email: 'organizer@example.com',
        name: 'Event Organizer',
        password: 'hashedpassword'
      }).returning();
      userId = user.id;
    });

    it('should create event with required fields', async () => {
      const eventData = {
        userId,
        title: 'Milonga Night',
        description: 'Traditional tango milonga',
        startDate: new Date('2025-07-01T20:00:00Z'),
        location: 'Buenos Aires, Argentina',
        eventType: 'milonga'
      };

      const [event] = await db.insert(schema.events).values(eventData).returning();

      expect(event.title).toBe('Milonga Night');
      expect(event.eventType).toBe('milonga');
      expect(event.userId).toBe(userId);
    });

    it('should handle event RSVP relationships', async () => {
      // Create event
      const [event] = await db.insert(schema.events).values({
        userId,
        title: 'Test Event',
        startDate: new Date(),
        location: 'Test Location'
      }).returning();

      // Create another user for RSVP
      const [attendee] = await db.insert(schema.users).values({
        username: 'attendee',
        email: 'attendee@example.com',
        name: 'Event Attendee',
        password: 'hashedpassword'
      }).returning();

      // Create RSVP
      const [rsvp] = await db.insert(schema.eventRsvps).values({
        eventId: event.id,
        userId: attendee.id,
        status: 'going'
      }).returning();

      expect(rsvp.status).toBe('going');
      expect(rsvp.eventId).toBe(event.id);
      expect(rsvp.userId).toBe(attendee.id);
    });
  });

  describe('Comments and Reactions', () => {
    let userId: number;
    let postId: number;

    beforeEach(async () => {
      const [user] = await db.insert(schema.users).values({
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword'
      }).returning();
      userId = user.id;

      const [post] = await db.insert(schema.posts).values({
        userId,
        content: 'Test post for comments'
      }).returning();
      postId = post.id;
    });

    it('should create comment on post', async () => {
      const commentData = {
        postId,
        userId,
        content: 'Great post!'
      };

      const [comment] = await db.insert(schema.postComments).values(commentData).returning();

      expect(comment.content).toBe('Great post!');
      expect(comment.postId).toBe(postId);
      expect(comment.userId).toBe(userId);
    });

    it('should create reaction on post', async () => {
      const reactionData = {
        postId,
        userId,
        reactionType: 'like'
      };

      const [reaction] = await db.insert(schema.postReactions).values(reactionData).returning();

      expect(reaction.reactionType).toBe('like');
      expect(reaction.postId).toBe(postId);
      expect(reaction.userId).toBe(userId);
    });

    it('should prevent duplicate reactions from same user', async () => {
      const reactionData = {
        postId,
        userId,
        reactionType: 'like'
      };

      await db.insert(schema.postReactions).values(reactionData);

      // Attempt to create duplicate reaction
      await expect(
        db.insert(schema.postReactions).values(reactionData)
      ).rejects.toThrow();
    });
  });

  describe('Role System', () => {
    let userId: number;

    beforeEach(async () => {
      const [user] = await db.insert(schema.users).values({
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword'
      }).returning();
      userId = user.id;
    });

    it('should create and assign roles to users', async () => {
      // Create role
      const [role] = await db.insert(schema.roles).values({
        name: 'dancer',
        description: 'Tango dancer role',
        communityRole: true
      }).returning();

      // Assign role to user
      const [userRole] = await db.insert(schema.userRoles).values({
        userId,
        roleId: role.id,
        isPrimary: true
      }).returning();

      expect(userRole.userId).toBe(userId);
      expect(userRole.roleId).toBe(role.id);
      expect(userRole.isPrimary).toBe(true);
    });

    it('should handle multiple roles per user', async () => {
      // Create multiple roles
      const [dancerRole] = await db.insert(schema.roles).values({
        name: 'dancer',
        description: 'Tango dancer role',
        communityRole: true
      }).returning();

      const [teacherRole] = await db.insert(schema.roles).values({
        name: 'teacher',
        description: 'Tango teacher role',
        communityRole: true
      }).returning();

      // Assign both roles
      await db.insert(schema.userRoles).values([
        { userId, roleId: dancerRole.id, isPrimary: true },
        { userId, roleId: teacherRole.id, isPrimary: false }
      ]);

      const userRoles = await db.select()
        .from(schema.userRoles)
        .where(schema.userRoles.userId.eq(userId));

      expect(userRoles).toHaveLength(2);
    });
  });

  describe('Media and Tags', () => {
    let userId: number;

    beforeEach(async () => {
      const [user] = await db.insert(schema.users).values({
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword'
      }).returning();
      userId = user.id;
    });

    it('should create media asset with metadata', async () => {
      const mediaData = {
        userId,
        fileName: 'tango-photo.jpg',
        fileUrl: 'https://example.com/tango-photo.jpg',
        fileSize: 1024000,
        mimeType: 'image/jpeg',
        folder: 'memories',
        visibility: 'public' as const
      };

      const [media] = await db.insert(schema.mediaAssets).values(mediaData).returning();

      expect(media.fileName).toBe('tango-photo.jpg');
      expect(media.visibility).toBe('public');
      expect(media.userId).toBe(userId);
    });

    it('should create tags and associate with media', async () => {
      // Create media asset
      const [media] = await db.insert(schema.mediaAssets).values({
        userId,
        fileName: 'tango-video.mp4',
        fileUrl: 'https://example.com/tango-video.mp4',
        fileSize: 5000000,
        mimeType: 'video/mp4',
        folder: 'events',
        visibility: 'public'
      }).returning();

      // Create tag
      const [tag] = await db.insert(schema.mediaTags).values({
        mediaId: media.id,
        tag: 'milonga'
      }).returning();

      expect(tag.tag).toBe('milonga');
      expect(tag.mediaId).toBe(media.id);
    });
  });
});