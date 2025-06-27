import {
  users,
  posts,
  events,
  eventRsvps,
  follows,
  postLikes,
  postComments,
  chatRooms,
  chatMessages,
  chatRoomUsers,
  stories,
  storyViews,
  danceExperiences,
  creatorExperiences,
  type User,
  type InsertUser,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Event,
  type InsertEvent,
  type EventRsvp,
  type ChatRoom,
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type Follow,
  type PostLike,
  type PostComment,
  type Story,
  type DanceExperience,
  type CreatorExperience,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, count, like, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserApiToken(id: number, token: string): Promise<void>;
  
  // Replit Auth operations
  getUserByReplitId(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateOnboardingStatus(id: number, formStatus: number, isComplete: boolean): Promise<User>;
  
  // Posts operations
  createPost(post: InsertPost): Promise<Post>;
  getPostById(id: number): Promise<Post | undefined>;
  getUserPosts(userId: number, limit?: number, offset?: number): Promise<Post[]>;
  getFeedPosts(userId: number, limit?: number, offset?: number): Promise<Post[]>;
  likePost(postId: number, userId: number): Promise<void>;
  unlikePost(postId: number, userId: number): Promise<void>;
  commentOnPost(postId: number, userId: number, content: string): Promise<PostComment>;
  getPostComments(postId: number): Promise<PostComment[]>;
  searchPosts(query: string, limit?: number): Promise<Post[]>;
  
  // Events operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEventById(id: number): Promise<Event | undefined>;
  getEvents(limit?: number, offset?: number): Promise<Event[]>;
  getUserEvents(userId: number): Promise<Event[]>;
  rsvpEvent(eventId: number, userId: number, status: string): Promise<EventRsvp>;
  getEventRsvps(eventId: number): Promise<EventRsvp[]>;
  
  // Follow operations
  followUser(followerId: number, followingId: number): Promise<Follow>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  
  // Chat operations
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  getChatRoom(slug: string): Promise<ChatRoom | undefined>;
  getUserChatRooms(userId: number): Promise<ChatRoom[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(roomSlug: string, limit?: number): Promise<ChatMessage[]>;
  
  // Stories operations
  createStory(userId: number, mediaUrl: string, mediaType: string, caption?: string): Promise<Story>;
  getActiveStories(userId: number): Promise<Story[]>;
  getFollowingStories(userId: number): Promise<Story[]>;
  viewStory(storyId: number, userId: number): Promise<void>;
  
  // Search operations
  searchUsers(query: string, limit?: number): Promise<User[]>;
  
  // Analytics operations
  getUserStats(userId: number): Promise<{
    postsCount: number;
    followersCount: number;
    followingCount: number;
    eventsCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserApiToken(id: number, token: string): Promise<void> {
    await db
      .update(users)
      .set({ apiToken: token, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // Posts operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getUserPosts(userId: number, limit = 20, offset = 0): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getFeedPosts(userId: number, limit = 20, offset = 0): Promise<Post[]> {
    // Get posts from followed users and own posts
    const followingIds = await db
      .select({ id: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const userIds = [userId, ...followingIds.map(f => f.id)];

    return await db
      .select()
      .from(posts)
      .where(inArray(posts.userId, userIds))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async likePost(postId: number, userId: number): Promise<void> {
    await db.insert(postLikes).values({ postId, userId });
    
    // Update likes count
    await db
      .update(posts)
      .set({ 
        likesCount: sql`${posts.likesCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
  }

  async unlikePost(postId: number, userId: number): Promise<void> {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    
    // Update likes count
    await db
      .update(posts)
      .set({ 
        likesCount: sql`${posts.likesCount} - 1`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
  }

  async commentOnPost(postId: number, userId: number, content: string): Promise<PostComment> {
    const [comment] = await db
      .insert(postComments)
      .values({ postId, userId, content })
      .returning();

    // Update comments count
    await db
      .update(posts)
      .set({ 
        commentsCount: sql`${posts.commentsCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));

    return comment;
  }

  async getPostComments(postId: number): Promise<PostComment[]> {
    return await db
      .select()
      .from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt));
  }

  async searchPosts(query: string, limit = 20): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(like(posts.content, `%${query}%`))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  // Events operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEvents(limit = 20, offset = 0): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.status, "active"))
      .orderBy(events.startDate)
      .limit(limit)
      .offset(offset);
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.createdAt));
  }

  async rsvpEvent(eventId: number, userId: number, status: string): Promise<EventRsvp> {
    const [rsvp] = await db
      .insert(eventRsvps)
      .values({ eventId, userId, status })
      .onConflictDoUpdate({
        target: [eventRsvps.eventId, eventRsvps.userId],
        set: { status, updatedAt: new Date() }
      })
      .returning();

    return rsvp;
  }

  async getEventRsvps(eventId: number): Promise<EventRsvp[]> {
    return await db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, eventId));
  }

  // Follow operations
  async followUser(followerId: number, followingId: number): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();
    return follow;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async getFollowers(userId: number): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
    
    return result.map(r => r.user);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
    
    return result.map(r => r.user);
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    
    return !!result;
  }

  // Chat operations
  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const roomWithSlug = { ...room, slug: nanoid() };
    const [newRoom] = await db
      .insert(chatRooms)
      .values(roomWithSlug)
      .returning();
    return newRoom;
  }

  async getChatRoom(slug: string): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.slug, slug));
    return room || undefined;
  }

  async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
    const result = await db
      .select({ room: chatRooms })
      .from(chatRoomUsers)
      .innerJoin(chatRooms, eq(chatRoomUsers.chatRoomSlug, chatRooms.slug))
      .where(eq(chatRoomUsers.userSlug, userId.toString()));
    
    return result.map(r => r.room);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const messageWithSlug = { ...message, slug: nanoid() };
    const [newMessage] = await db
      .insert(chatMessages)
      .values(messageWithSlug)
      .returning();
    return newMessage;
  }

  async getChatMessages(roomSlug: string, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatRoomSlug, roomSlug))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Stories operations
  async createStory(userId: number, mediaUrl: string, mediaType: string, caption?: string): Promise<Story> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Stories expire after 24 hours

    const [story] = await db
      .insert(stories)
      .values({ userId, mediaUrl, mediaType, caption, expiresAt })
      .returning();
    
    return story;
  }

  async getActiveStories(userId: number): Promise<Story[]> {
    return await db
      .select()
      .from(stories)
      .where(and(
        eq(stories.userId, userId),
        sql`${stories.expiresAt} > NOW()`
      ))
      .orderBy(desc(stories.createdAt));
  }

  async getFollowingStories(userId: number): Promise<Story[]> {
    const followingIds = await db
      .select({ id: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const userIds = followingIds.map(f => f.id);

    return await db
      .select()
      .from(stories)
      .where(and(
        inArray(stories.userId, userIds),
        sql`${stories.expiresAt} > NOW()`
      ))
      .orderBy(desc(stories.createdAt));
  }

  async viewStory(storyId: number, userId: number): Promise<void> {
    await db
      .insert(storyViews)
      .values({ storyId, userId })
      .onConflictDoNothing();

    // Update views count
    await db
      .update(stories)
      .set({ viewsCount: sql`${stories.viewsCount} + 1` })
      .where(eq(stories.id, storyId));
  }

  // Search operations
  async searchUsers(query: string, limit = 20): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(or(
        like(users.username, `%${query}%`),
        like(users.name, `%${query}%`)
      ))
      .limit(limit);
  }

  // Analytics operations
  async getUserStats(userId: number): Promise<{
    postsCount: number;
    followersCount: number;
    followingCount: number;
    eventsCount: number;
  }> {
    const [postsCount] = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.userId, userId));

    const [followersCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, userId));

    const [followingCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const [eventsCount] = await db
      .select({ count: count() })
      .from(events)
      .where(eq(events.userId, userId));

    return {
      postsCount: postsCount.count,
      followersCount: followersCount.count,
      followingCount: followingCount.count,
      eventsCount: eventsCount.count,
    };
  }

  // Replit Auth operations
  async getUserByReplitId(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.apiToken, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // For Replit Auth, we'll store the Replit user ID in apiToken field for now
    const existingUser = await this.getUserByReplitId(userData.id?.toString() || '');
    
    if (existingUser) {
      const [updatedUser] = await db
        .update(users)
        .set({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImage: userData.profileImage,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updatedUser;
    } else {
      // Create new user with Replit data
      const [newUser] = await db
        .insert(users)
        .values({
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
          username: userData.email?.split('@')[0] || `user_${Date.now()}`,
          email: userData.email || '',
          password: '', // No password needed for Replit Auth
          profileImage: userData.profileImage,
          firstName: userData.firstName,
          lastName: userData.lastName,
          apiToken: userData.id?.toString() || '', // Store Replit ID here
          formStatus: 0,
          isOnboardingComplete: false,
        })
        .returning();
      return newUser;
    }
  }

  async updateOnboardingStatus(id: number, formStatus: number, isComplete: boolean): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        formStatus,
        isOnboardingComplete: isComplete,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
}

export const storage = new DatabaseStorage();
