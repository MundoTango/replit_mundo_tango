import {
  users,
  posts,
  events,
  eventRsvps,
  eventParticipants,
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
  mediaAssets,
  mediaTags,
  mediaUsage,
  friends,
  memoryMedia,
  type User,
  type InsertUser,
  type UpsertUser,
  type Post,
  type InsertPost,
  type MediaAsset,
  type InsertMediaAsset,
  type MediaUsage,
  type InsertMediaUsage,
  type Friend,
  type InsertFriend,
  type MemoryMedia,
  type InsertMemoryMedia,
  type Event,
  type InsertEvent,
  type EventRsvp,
  type EventParticipant,
  type InsertEventParticipant,
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
  getFeedPosts(userId: number, limit?: number, offset?: number, filterTags?: string[]): Promise<Post[]>;
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

  // Media operations
  createMediaAsset(mediaAsset: InsertMediaAsset): Promise<MediaAsset>;
  getMediaAsset(id: string): Promise<MediaAsset | undefined>;
  getUserMediaAssets(userId: number, folder?: string, limit?: number): Promise<MediaAsset[]>;
  updateMediaAsset(id: string, updates: Partial<MediaAsset>): Promise<MediaAsset>;
  deleteMediaAsset(id: string): Promise<void>;
  addMediaTag(mediaId: string, tag: string): Promise<void>;
  removeMediaTag(mediaId: string, tag: string): Promise<void>;
  getMediaTags(mediaId: string): Promise<string[]>;
  searchMediaByTag(tag: string, limit?: number): Promise<MediaAsset[]>;
  
  // Media usage operations
  createMediaUsage(usage: InsertMediaUsage): Promise<MediaUsage>;
  getMediaUsage(mediaId: string): Promise<MediaUsage[]>;
  deleteMediaUsage(mediaId: string, usedIn: string, refId: number): Promise<void>;
  
  // Friends operations for mutual visibility
  createFriendship(friendship: InsertFriend): Promise<Friend>;
  getFriends(userId: number): Promise<User[]>;
  getMutualFriends(userId1: number, userId2: number): Promise<boolean>;
  updateFriendshipStatus(userId: number, friendId: number, status: string): Promise<Friend>;
  deleteFriendship(userId: number, friendId: number): Promise<void>;

  // Event Participants operations for role tagging system
  createEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant>;
  getUserEventInvitations(userId: number, status?: string): Promise<EventParticipant[]>;
  getEventParticipants(eventId: number, status?: string): Promise<EventParticipant[]>;
  updateEventParticipantStatus(participantId: number, status: string, userId: number): Promise<EventParticipant>;
  getUserAcceptedRoles(userId: number): Promise<EventParticipant[]>;
  getEventRoleInvitation(eventId: number, userId: number, role: string): Promise<EventParticipant | undefined>;
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

  async getFeedPosts(userId: number, limit = 20, offset = 0, filterTags: string[] = []): Promise<Post[]> {
    // Get posts from followed users and own posts
    const followingIds = await db
      .select({ id: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const userIds = [userId, ...followingIds.map(f => f.id)];

    let feedPosts;

    // If tag filtering is enabled, use a different query with JOINs
    if (filterTags.length > 0) {
      feedPosts = await db
        .select({
          id: posts.id,
          userId: posts.userId,
          content: posts.content,
          imageUrl: posts.imageUrl,
          videoUrl: posts.videoUrl,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          sharesCount: posts.sharesCount,
          hashtags: posts.hashtags,
          isPublic: posts.isPublic,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          userName: users.name,
          userUsername: users.username,
          userProfileImage: users.profileImage,
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .innerJoin(memoryMedia, eq(posts.id, memoryMedia.memoryId))
        .innerJoin(mediaTags, eq(memoryMedia.mediaId, mediaTags.mediaId))
        .where(
          and(
            eq(posts.isPublic, true),
            inArray(mediaTags.tag, filterTags)
          )
        )
        .groupBy(
          posts.id,
          posts.userId,
          posts.content,
          posts.imageUrl,
          posts.videoUrl,
          posts.likesCount,
          posts.commentsCount,
          posts.sharesCount,
          posts.hashtags,
          posts.isPublic,
          posts.createdAt,
          posts.updatedAt,
          users.name,
          users.username,
          users.profileImage
        )
        .having(sql`COUNT(DISTINCT ${mediaTags.tag}) >= ${filterTags.length}`)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      // For all posts without tag filtering
      feedPosts = await db
        .select({
          id: posts.id,
          userId: posts.userId,
          content: posts.content,
          imageUrl: posts.imageUrl,
          videoUrl: posts.videoUrl,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          sharesCount: posts.sharesCount,
          hashtags: posts.hashtags,
          isPublic: posts.isPublic,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          userName: users.name,
          userUsername: users.username,
          userProfileImage: users.profileImage,
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .where(eq(posts.isPublic, true))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);
    }

    // Transform to include user object
    return feedPosts.map(post => ({
      id: post.id,
      userId: post.userId,
      content: post.content,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      sharesCount: post.sharesCount,
      hashtags: post.hashtags,
      isPublic: post.isPublic,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: {
        id: post.userId,
        name: post.userName,
        username: post.userUsername,
        profileImage: post.userProfileImage,
      }
    })) as Post[];
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
    const result = await db
      .select({
        id: postComments.id,
        content: postComments.content,
        createdAt: postComments.createdAt,
        updatedAt: postComments.updatedAt,
        userId: postComments.userId,
        postId: postComments.postId,
        parentId: postComments.parentId,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(postComments)
      .innerJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt));

    return result as any[];
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
    const result = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        imageUrl: events.imageUrl,
        eventType: events.eventType,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        city: events.city,
        country: events.country,
        price: events.price,
        maxAttendees: events.maxAttendees,
        currentAttendees: events.currentAttendees,
        isPublic: events.isPublic,
        status: events.status,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        userId: events.userId,
        userName: users.name,
        userUsername: users.username,
        userProfileImage: users.profileImage,
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .where(eq(events.status, "active"))
      .orderBy(events.startDate)
      .limit(limit)
      .offset(offset);

    return result.map(event => ({
      id: event.id,
      userId: event.userId,
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
      eventType: event.eventType,
      startDate: event.startDate || new Date(),
      endDate: event.endDate,
      location: event.location,
      city: event.city,
      country: event.country,
      latitude: null,
      longitude: null,
      price: event.price,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      isPublic: event.isPublic,
      status: event.status,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));
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

  // Media operations
  async createMediaAsset(mediaAsset: InsertMediaAsset): Promise<MediaAsset> {
    const [asset] = await db
      .insert(mediaAssets)
      .values(mediaAsset)
      .returning();
    return asset;
  }

  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id));
    return asset || undefined;
  }

  async getUserMediaAssets(userId: number, folder?: string, limit = 20): Promise<MediaAsset[]> {
    if (folder) {
      return await db
        .select()
        .from(mediaAssets)
        .where(and(
          eq(mediaAssets.userId, userId),
          eq(mediaAssets.folder, folder)
        ))
        .orderBy(desc(mediaAssets.createdAt))
        .limit(limit);
    }

    return await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.userId, userId))
      .orderBy(desc(mediaAssets.createdAt))
      .limit(limit);
  }

  async updateMediaAsset(id: string, updates: Partial<MediaAsset>): Promise<MediaAsset> {
    const [asset] = await db
      .update(mediaAssets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mediaAssets.id, id))
      .returning();
    return asset;
  }

  async deleteMediaAsset(id: string): Promise<void> {
    await db
      .delete(mediaAssets)
      .where(eq(mediaAssets.id, id));
  }

  async addMediaTag(mediaId: string, tag: string): Promise<void> {
    await db
      .insert(mediaTags)
      .values({ mediaId, tag })
      .onConflictDoNothing();
  }

  async removeMediaTag(mediaId: string, tag: string): Promise<void> {
    await db
      .delete(mediaTags)
      .where(and(
        eq(mediaTags.mediaId, mediaId),
        eq(mediaTags.tag, tag)
      ));
  }

  async getMediaTags(mediaId: string): Promise<string[]> {
    const tags = await db
      .select({ tag: mediaTags.tag })
      .from(mediaTags)
      .where(eq(mediaTags.mediaId, mediaId));
    return tags.map(t => t.tag);
  }

  async searchMediaByTag(tag: string, limit = 20): Promise<MediaAsset[]> {
    return await db
      .select({
        id: mediaAssets.id,
        userId: mediaAssets.userId,
        originalFilename: mediaAssets.originalFilename,
        path: mediaAssets.path,
        url: mediaAssets.url,
        visibility: mediaAssets.visibility,
        contentType: mediaAssets.contentType,
        width: mediaAssets.width,
        height: mediaAssets.height,
        size: mediaAssets.size,
        folder: mediaAssets.folder,
        createdAt: mediaAssets.createdAt,
        updatedAt: mediaAssets.updatedAt
      })
      .from(mediaAssets)
      .innerJoin(mediaTags, eq(mediaAssets.id, mediaTags.mediaId))
      .where(eq(mediaTags.tag, tag))
      .limit(limit);
  }

  // Media usage operations
  async createMediaUsage(usage: InsertMediaUsage): Promise<MediaUsage> {
    const [mediaUsageRecord] = await db
      .insert(mediaUsage)
      .values(usage)
      .returning();
    return mediaUsageRecord;
  }

  async getMediaUsage(mediaId: string): Promise<MediaUsage[]> {
    return await db
      .select()
      .from(mediaUsage)
      .where(eq(mediaUsage.mediaId, mediaId));
  }

  async deleteMediaUsage(mediaId: string, usedIn: string, refId: number): Promise<void> {
    await db
      .delete(mediaUsage)
      .where(and(
        eq(mediaUsage.mediaId, mediaId),
        eq(mediaUsage.usedIn, usedIn),
        eq(mediaUsage.refId, refId)
      ));
  }

  // Friends operations for mutual visibility
  async createFriendship(friendship: InsertFriend): Promise<Friend> {
    const [friend] = await db
      .insert(friends)
      .values(friendship)
      .returning();
    return friend;
  }

  async getFriends(userId: number): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        profileImage: users.profileImage,
        firstName: users.firstName,
        lastName: users.lastName,
        country: users.country,
        city: users.city,
        bio: users.bio,
        isVerified: users.isVerified,
        createdAt: users.createdAt
      })
      .from(friends)
      .innerJoin(users, eq(friends.friendId, users.id))
      .where(and(
        eq(friends.userId, userId),
        eq(friends.status, 'accepted')
      ));
  }

  async getMutualFriends(userId1: number, userId2: number): Promise<boolean> {
    // Check if there's a reciprocal friendship between the two users
    const friendship1 = await db
      .select()
      .from(friends)
      .where(and(
        eq(friends.userId, userId1),
        eq(friends.friendId, userId2),
        eq(friends.status, 'accepted')
      ))
      .limit(1);

    const friendship2 = await db
      .select()
      .from(friends)
      .where(and(
        eq(friends.userId, userId2),
        eq(friends.friendId, userId1),
        eq(friends.status, 'accepted')
      ))
      .limit(1);

    return friendship1.length > 0 && friendship2.length > 0;
  }

  async updateFriendshipStatus(userId: number, friendId: number, status: string): Promise<Friend> {
    const [friendship] = await db
      .update(friends)
      .set({ status, updatedAt: new Date() })
      .where(and(
        eq(friends.userId, userId),
        eq(friends.friendId, friendId)
      ))
      .returning();
    return friendship;
  }

  async deleteFriendship(userId: number, friendId: number): Promise<void> {
    await db
      .delete(friends)
      .where(and(
        eq(friends.userId, userId),
        eq(friends.friendId, friendId)
      ));
  }

  // Event Participants operations for role tagging system
  async createEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant> {
    const [newParticipant] = await db
      .insert(eventParticipants)
      .values(participant)
      .returning();
    return newParticipant;
  }

  async getUserEventInvitations(userId: number, status?: string): Promise<EventParticipant[]> {
    let whereConditions = [eq(eventParticipants.userId, userId)];
    
    if (status) {
      whereConditions.push(eq(eventParticipants.status, status));
    }

    return db
      .select({
        id: eventParticipants.id,
        eventId: eventParticipants.eventId,
        userId: eventParticipants.userId,
        role: eventParticipants.role,
        status: eventParticipants.status,
        invitedBy: eventParticipants.invitedBy,
        invitedAt: eventParticipants.invitedAt,
        respondedAt: eventParticipants.respondedAt,
        createdAt: eventParticipants.createdAt,
        updatedAt: eventParticipants.updatedAt,
        eventTitle: events.title,
        eventStartDate: events.startDate,
        eventLocation: events.location,
        inviterName: users.name,
      })
      .from(eventParticipants)
      .innerJoin(events, eq(eventParticipants.eventId, events.id))
      .innerJoin(users, eq(eventParticipants.invitedBy, users.id))
      .where(and(...whereConditions))
      .orderBy(desc(eventParticipants.invitedAt));
  }

  async getEventParticipants(eventId: number, status?: string): Promise<EventParticipant[]> {
    let whereConditions = [eq(eventParticipants.eventId, eventId)];
    
    if (status) {
      whereConditions.push(eq(eventParticipants.status, status));
    }

    return db
      .select({
        id: eventParticipants.id,
        eventId: eventParticipants.eventId,
        userId: eventParticipants.userId,
        role: eventParticipants.role,
        status: eventParticipants.status,
        invitedBy: eventParticipants.invitedBy,
        invitedAt: eventParticipants.invitedAt,
        respondedAt: eventParticipants.respondedAt,
        createdAt: eventParticipants.createdAt,
        updatedAt: eventParticipants.updatedAt,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(eventParticipants)
      .innerJoin(users, eq(eventParticipants.userId, users.id))
      .where(and(...whereConditions))
      .orderBy(desc(eventParticipants.invitedAt));
  }

  async updateEventParticipantStatus(participantId: number, status: string, userId: number): Promise<EventParticipant> {
    const [updatedParticipant] = await db
      .update(eventParticipants)
      .set({ 
        status, 
        respondedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(and(
        eq(eventParticipants.id, participantId),
        eq(eventParticipants.userId, userId)
      ))
      .returning();
    return updatedParticipant;
  }

  async getUserAcceptedRoles(userId: number): Promise<EventParticipant[]> {
    return db
      .select({
        id: eventParticipants.id,
        eventId: eventParticipants.eventId,
        userId: eventParticipants.userId,
        role: eventParticipants.role,
        status: eventParticipants.status,
        invitedBy: eventParticipants.invitedBy,
        invitedAt: eventParticipants.invitedAt,
        respondedAt: eventParticipants.respondedAt,
        createdAt: eventParticipants.createdAt,
        updatedAt: eventParticipants.updatedAt,
        eventTitle: events.title,
        eventStartDate: events.startDate,
        eventLocation: events.location,
        inviterName: users.name,
      })
      .from(eventParticipants)
      .innerJoin(events, eq(eventParticipants.eventId, events.id))
      .innerJoin(users, eq(eventParticipants.invitedBy, users.id))
      .where(and(
        eq(eventParticipants.userId, userId),
        eq(eventParticipants.status, 'accepted')
      ))
      .orderBy(desc(events.startDate));
  }

  async getEventRoleInvitation(eventId: number, userId: number, role: string): Promise<EventParticipant | undefined> {
    const [invitation] = await db
      .select()
      .from(eventParticipants)
      .where(and(
        eq(eventParticipants.eventId, eventId),
        eq(eventParticipants.userId, userId),
        eq(eventParticipants.role, role)
      ))
      .limit(1);
    return invitation || undefined;
  }

  // Memory Media Management
  async createMemoryMedia(memoryMediaData: InsertMemoryMedia): Promise<MemoryMedia> {
    const [created] = await db.insert(memoryMedia).values(memoryMediaData).returning();
    return created;
  }

  async getMemoryMedia(memoryId: number): Promise<(MemoryMedia & { mediaUrl: string, originalFilename: string, contentType: string })[]> {
    return db
      .select({
        id: memoryMedia.id,
        memoryId: memoryMedia.memoryId,
        mediaId: memoryMedia.mediaId,
        taggedBy: memoryMedia.taggedBy,
        caption: memoryMedia.caption,
        sortOrder: memoryMedia.sortOrder,
        createdAt: memoryMedia.createdAt,
        mediaUrl: mediaAssets.url,
        originalFilename: mediaAssets.originalFilename,
        contentType: mediaAssets.contentType,
      })
      .from(memoryMedia)
      .innerJoin(mediaAssets, eq(memoryMedia.mediaId, mediaAssets.id))
      .where(eq(memoryMedia.memoryId, memoryId))
      .orderBy(memoryMedia.sortOrder, memoryMedia.createdAt);
  }

  async getUserMedia(userId: number, limit: number = 50): Promise<MediaAsset[]> {
    return db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.userId, userId))
      .orderBy(desc(mediaAssets.createdAt))
      .limit(limit);
  }

  async deleteMemoryMedia(memoryId: number, mediaId: string, userId: number): Promise<boolean> {
    const result = await db
      .delete(memoryMedia)
      .where(and(
        eq(memoryMedia.memoryId, memoryId),
        eq(memoryMedia.mediaId, mediaId),
        eq(memoryMedia.taggedBy, userId)
      ))
      .returning();
    return result.length > 0;
  }

  async createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset> {
    const [created] = await db.insert(mediaAssets).values(asset).returning();
    return created;
  }

  async getMediaAsset(mediaId: string): Promise<MediaAsset | undefined> {
    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, mediaId))
      .limit(1);
    return asset || undefined;
  }
}

export const storage = new DatabaseStorage();
