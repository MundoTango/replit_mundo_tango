import {
  users,
  posts,
  events,
  eventRsvps,
  eventParticipants,
  userFollowedCities,
  follows,
  postLikes,
  postComments,
  chatRooms,
  chatMessages,
  stories,
  storyViews,
  mediaAssets,
  mediaTags,
  mediaUsage,
  friends,
  memoryMedia,
  roles,
  userRoles,
  customRoleRequests,
  type User,
  type InsertUser,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Event,
  type InsertEvent,
  type EventRsvp,
  type EventParticipant,
  type InsertEventParticipant,
  type Follow,
  type PostLike,
  type PostComment,
  type InsertComment,
  type ChatRoom,
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type MediaAsset,
  type InsertMediaAsset,
  type MediaUsage,
  type InsertMediaUsage,
  type Friend,
  type InsertFriend,
  type MemoryMedia,
  type InsertMemoryMedia,
  type Story,
  type CustomRoleRequest,
  type InsertCustomRoleRequest,
  type UpdateCustomRoleRequest
} from '../shared/schema';
import { db } from './db';
import { eq, desc, asc, sql, and, or, gte, lte, count, ilike, inArray } from 'drizzle-orm';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserApiToken(id: number, token: string): Promise<void>;
  
  // Role operations
  getAllRoles(): Promise<any[]>;
  getCommunityRoles(): Promise<any[]>;
  getUserRoles(userId: number): Promise<any[]>;
  assignRoleToUser(userId: number, roleName: string, assignedBy?: number): Promise<any>;
  removeRoleFromUser(userId: number, roleName: string): Promise<void>;
  userHasRole(userId: number, roleName: string): Promise<boolean>;
  
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
  getUserEventRsvps(userId: number): Promise<EventRsvp[]>;
  
  // User followed cities
  getUserFollowedCities(userId: number): Promise<{ id: number; city: string; country: string; userId: number; createdAt: Date | null }[]>;
  addFollowedCity(userId: number, city: string, country: string): Promise<{ id: number; city: string; country: string; userId: number; createdAt: Date | null }>;
  removeFollowedCity(userId: number, cityId: number): Promise<void>;
  
  // Follow operations
  followUser(followerId: number, followingId: number): Promise<Follow>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  
  // Search operations
  searchUsers(query: string, limit?: number): Promise<User[]>;
  
  // Analytics operations
  getUserStats(userId: number): Promise<{
    postsCount: number;
    followersCount: number;
    followingCount: number;
    eventsCount: number;
  }>;

  // Replit Auth operations (simplified)
  getUserByReplitId(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateOnboardingStatus(id: number, formStatus: number, isComplete: boolean): Promise<User>;
  
  // Media operations
  createMediaAsset(mediaAsset: InsertMediaAsset): Promise<MediaAsset>;
  getMediaAsset(id: string): Promise<MediaAsset | undefined>;
  getUserMediaAssets(userId: number, folder?: string, limit?: number): Promise<MediaAsset[]>;
  updateMediaAsset(id: string, updates: Partial<MediaAsset>): Promise<MediaAsset>;
  deleteMediaAsset(id: string): Promise<void>;
  
  // Enhanced features
  createEnhancedPost(post: InsertPost): Promise<Post>;
  createEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant>;
  getFollowingStories(userId: number): Promise<Story[]>;
  createStory(story: any): Promise<Story>;
  getUserChatRooms(userId: number): Promise<ChatRoom[]>;
  getChatMessages(roomId: number): Promise<ChatMessage[]>;
  addMediaTag(mediaId: string, tag: string, userId: number): Promise<any>;
  getMediaTags(mediaId: string): Promise<any[]>;
  searchMediaByTag(tag: string): Promise<MediaAsset[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  createFriendship(friendship: InsertFriend): Promise<Friend>;
  getUserMedia(userId: number): Promise<MediaAsset[]>;
  createMemoryMedia(memoryMedia: InsertMemoryMedia): Promise<MemoryMedia>;
  getMemoryMedia(memoryId: number): Promise<any[]>;
  deleteMemoryMedia(id: number): Promise<void>;
  getEventRoleInvitation(eventId: number, userId: number): Promise<EventParticipant | undefined>;
  getEventParticipants(eventId: number): Promise<EventParticipant[]>;
  getUserEventInvitations(userId: number): Promise<EventParticipant[]>;
  updateEventParticipantStatus(id: number, status: string): Promise<EventParticipant>;
  getUserAcceptedRoles(userId: number): Promise<EventParticipant[]>;
  createComment(comment: InsertComment): Promise<PostComment>;
  getCommentsByPostId(postId: number): Promise<PostComment[]>;
  createReaction(reaction: any): Promise<any>;
  removeReaction(postId: number, userId: number): Promise<void>;
  createReport(report: any): Promise<any>;
  getNotificationsByUserId(userId: number): Promise<any[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;

  // Enhanced post features for rich content support
  createCommentWithMentions(comment: InsertComment & { mentions?: string[] }): Promise<PostComment>;
  updateComment(id: number, updates: Partial<PostComment>): Promise<PostComment>;
  deleteComment(id: number): Promise<void>;
  createPostReaction(postId: number, userId: number, reactionType: string): Promise<any>;
  getPostReactions(postId: number): Promise<any[]>;
  upsertPostReaction(postId: number, userId: number, reactionType: string): Promise<any>;
  createNotification(userId: number, type: string, title: string, message: string, data?: any): Promise<any>;
  createPostReport(postId: number, reporterId: number, reason: string, description?: string): Promise<any>;
  getPostsByLocation(lat: number, lng: number, radiusKm?: number): Promise<Post[]>;
  getPostsByHashtags(hashtags: string[]): Promise<Post[]>;
  getPostsByMentions(username: string): Promise<Post[]>;
  updatePostEngagement(postId: number): Promise<void>;
  markCommentsAsRead(postId: number, userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
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

  // Role operations implementation
  async getAllRoles(): Promise<any[]> {
    return await db.select().from(roles).orderBy(asc(roles.name));
  }

  async getCommunityRoles(): Promise<any[]> {
    return await db
      .select()
      .from(roles)
      .where(eq(roles.isPlatformRole, false))
      .orderBy(asc(roles.name));
  }

  async getUserRoles(userId: number): Promise<any[]> {
    return await db
      .select({
        roleName: userRoles.roleName,
        description: roles.description,
        assignedAt: userRoles.assignedAt,
        isPlatformRole: roles.isPlatformRole
      })
      .from(userRoles)
      .leftJoin(roles, eq(userRoles.roleName, roles.name))
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(userRoles.assignedAt));
  }

  async assignRoleToUser(userId: number, roleName: string, assignedBy?: number): Promise<any> {
    // Check if role exists
    const roleExists = await db
      .select()
      .from(roles)
      .where(eq(roles.name, roleName))
      .limit(1);
    
    if (roleExists.length === 0) {
      throw new Error(`Role '${roleName}' does not exist`);
    }

    // Insert role assignment with conflict handling
    const [assignment] = await db
      .insert(userRoles)
      .values({
        userId,
        roleName,
        assignedBy: assignedBy || null,
        assignedAt: new Date()
      })
      .onConflictDoNothing()
      .returning();

    return assignment;
  }

  async removeRoleFromUser(userId: number, roleName: string): Promise<void> {
    await db
      .delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleName, roleName)
        )
      );
  }

  async userHasRole(userId: number, roleName: string): Promise<boolean> {
    const result = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleName, roleName)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // Custom Role Request methods
  async createCustomRoleRequest(request: any): Promise<any> {
    const [newRequest] = await db
      .insert(customRoleRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async getUserCustomRoleRequests(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(customRoleRequests)
      .where(eq(customRoleRequests.submittedBy, userId))
      .orderBy(desc(customRoleRequests.createdAt));
  }

  async getAllCustomRoleRequests(): Promise<any[]> {
    return await db
      .select({
        id: customRoleRequests.id,
        roleName: customRoleRequests.roleName,
        roleDescription: customRoleRequests.roleDescription,
        submittedBy: customRoleRequests.submittedBy,
        status: customRoleRequests.status,
        adminNotes: customRoleRequests.adminNotes,
        createdAt: customRoleRequests.createdAt,
        updatedAt: customRoleRequests.updatedAt,
        submitterName: users.name,
        submitterEmail: users.email,
      })
      .from(customRoleRequests)
      .leftJoin(users, eq(customRoleRequests.submittedBy, users.id))
      .orderBy(desc(customRoleRequests.createdAt));
  }

  async updateCustomRoleRequest(id: string, updates: any): Promise<any> {
    const [updatedRequest] = await db
      .update(customRoleRequests)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(customRoleRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async approveCustomRoleRequest(id: string, approvedBy: number, adminNotes?: string): Promise<any> {
    const request = await db
      .select()
      .from(customRoleRequests)
      .where(eq(customRoleRequests.id, id))
      .limit(1);

    if (request.length === 0) {
      throw new Error('Custom role request not found');
    }

    // Update request status
    const [updatedRequest] = await db
      .update(customRoleRequests)
      .set({
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(customRoleRequests.id, id))
      .returning();

    // Create the custom role
    const roleName = request[0].roleName.toLowerCase().replace(/\s+/g, '_');
    await db
      .insert(roles)
      .values({
        name: roleName,
        description: request[0].roleDescription,
        isPlatformRole: false,
        isCustom: true,
        isApproved: true,
        submittedBy: request[0].submittedBy,
        approvedBy,
        approvedAt: new Date(),
        submittedAt: request[0].createdAt,
      })
      .onConflictDoNothing();

    // Assign the role to the requesting user
    await this.assignRoleToUser(request[0].submittedBy, roleName, approvedBy);

    return updatedRequest;
  }

  async rejectCustomRoleRequest(id: string, rejectedBy: number, adminNotes?: string): Promise<any> {
    const [updatedRequest] = await db
      .update(customRoleRequests)
      .set({
        status: 'rejected',
        rejectedBy,
        rejectedAt: new Date(),
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(customRoleRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
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
    if (filterTags.length === 0) {
      return await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);
    }

    // Simple filtering by hashtags for now
    return await db
      .select()
      .from(posts)
      .where(
        and(
          ...filterTags.map(tag => sql`${posts.hashtags} @> ARRAY[${tag}]`)
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async likePost(postId: number, userId: number): Promise<void> {
    await db.insert(postLikes).values({ postId, userId }).onConflictDoNothing();
  }

  async unlikePost(postId: number, userId: number): Promise<void> {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
  }

  async commentOnPost(postId: number, userId: number, content: string): Promise<PostComment> {
    const [comment] = await db
      .insert(postComments)
      .values({ postId, userId, content })
      .returning();
    return comment;
  }

  async getPostComments(postId: number): Promise<PostComment[]> {
    return await db
      .select()
      .from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(asc(postComments.createdAt));
  }

  async searchPosts(query: string, limit = 20): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(ilike(posts.content, `%${query}%`))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async getEvents(limit = 20, offset = 0): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .orderBy(desc(events.startDate))
      .limit(limit)
      .offset(offset);
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.startDate));
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

  async getUserEventRsvps(userId: number): Promise<EventRsvp[]> {
    return await db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.userId, userId));
  }

  async getUserFollowedCities(userId: number): Promise<{ id: number; city: string; country: string; userId: number; createdAt: Date | null }[]> {
    return await db
      .select()
      .from(userFollowedCities)
      .where(eq(userFollowedCities.userId, userId));
  }

  async addFollowedCity(userId: number, city: string, country: string): Promise<{ id: number; city: string; country: string; userId: number; createdAt: Date | null }> {
    const [followedCity] = await db
      .insert(userFollowedCities)
      .values({ userId, city, country })
      .returning();
    return followedCity;
  }

  async removeFollowedCity(userId: number, cityId: number): Promise<void> {
    await db
      .delete(userFollowedCities)
      .where(and(eq(userFollowedCities.userId, userId), eq(userFollowedCities.id, cityId)));
  }

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
      .select()
      .from(users)
      .innerJoin(follows, eq(users.id, follows.followerId))
      .where(eq(follows.followingId, userId));
    
    return result.map(r => r.users);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .innerJoin(follows, eq(users.id, follows.followingId))
      .where(eq(follows.followerId, userId));
    
    return result.map(r => r.users);
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);
    return result.length > 0;
  }

  async searchUsers(query: string, limit = 20): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.name, `%${query}%`),
          ilike(users.username, `%${query}%`),
          ilike(users.email, `%${query}%`)
        )
      )
      .limit(limit);
  }

  async getUserStats(userId: number): Promise<{
    postsCount: number;
    followersCount: number;
    followingCount: number;
    eventsCount: number;
  }> {
    const [postsResult] = await db.select({ count: count() }).from(posts).where(eq(posts.userId, userId));
    const [followersResult] = await db.select({ count: count() }).from(follows).where(eq(follows.followingId, userId));
    const [followingResult] = await db.select({ count: count() }).from(follows).where(eq(follows.followerId, userId));
    const [eventsResult] = await db.select({ count: count() }).from(events).where(eq(events.userId, userId));

    return {
      postsCount: postsResult.count,
      followersCount: followersResult.count,
      followingCount: followingResult.count,
      eventsCount: eventsResult.count
    };
  }

  async getUserByReplitId(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.replitId, id)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: userData.password || 'temp_password' // Required field
      })
      .onConflictDoUpdate({
        target: users.replitId,
        set: {
          name: userData.name,
          username: userData.username,
          profileImage: userData.profileImage,
          email: userData.email,
          updatedAt: sql`NOW()`
        }
      })
      .returning();
    return user;
  }

  async updateOnboardingStatus(id: number, formStatus: number, isComplete: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        formStatus,
        isOnboardingComplete: isComplete,
        updatedAt: sql`NOW()`
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createMediaAsset(mediaAsset: InsertMediaAsset): Promise<MediaAsset> {
    const [asset] = await db.insert(mediaAssets).values(mediaAsset).returning();
    return asset;
  }

  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    const result = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
    return result[0];
  }

  async getUserMediaAssets(userId: number, folder?: string, limit = 20): Promise<MediaAsset[]> {
    let whereConditions = [eq(mediaAssets.userId, userId)];
    
    if (folder) {
      whereConditions.push(eq(mediaAssets.folder, folder));
    }

    return await db
      .select()
      .from(mediaAssets)
      .where(and(...whereConditions))
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
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  }

  // Additional methods required by routes.ts
  async createEnhancedPost(post: InsertPost): Promise<Post> {
    return this.createPost(post);
  }

  async createEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant> {
    const [newParticipant] = await db.insert(eventParticipants).values(participant).returning();
    return newParticipant;
  }

  async getFollowingStories(userId: number): Promise<Story[]> {
    const followingUsers = await db
      .select({ id: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    const followingIds = followingUsers.map(u => u.id);
    
    return await db
      .select()
      .from(stories)
      .where(inArray(stories.userId, followingIds))
      .orderBy(desc(stories.createdAt));
  }

  async createStory(story: any): Promise<Story> {
    const [newStory] = await db.insert(stories).values(story).returning();
    return newStory;
  }

  async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
    return await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.userId, userId));
  }

  async getChatMessages(roomId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatRoomSlug, roomId.toString()))
      .orderBy(asc(chatMessages.createdAt));
  }

  async addMediaTag(mediaId: string, tag: string, userId: number): Promise<any> {
    // Placeholder implementation - media_tags table structure needs verification
    return { id: 1, mediaId, tag, userId, createdAt: new Date() };
  }

  async getMediaTags(mediaId: string): Promise<any[]> {
    // Placeholder implementation - media_tags table structure needs verification
    return [];
  }

  async searchMediaByTag(tag: string): Promise<MediaAsset[]> {
    // Placeholder implementation - media_tags relationship needs verification
    return [];
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async createFriendship(friendship: InsertFriend): Promise<Friend> {
    const [newFriendship] = await db.insert(friends).values(friendship).returning();
    return newFriendship;
  }

  async getUserMedia(userId: number): Promise<MediaAsset[]> {
    return this.getUserMediaAssets(userId);
  }

  async createMemoryMedia(memoryMediaData: InsertMemoryMedia): Promise<MemoryMedia> {
    // Placeholder implementation - memory_media table structure needs verification
    return { 
      id: 1, 
      memoryId: memoryMediaData.memoryId, 
      mediaId: memoryMediaData.mediaId, 
      taggedBy: memoryMediaData.taggedBy,
      caption: memoryMediaData.caption || null,
      sortOrder: memoryMediaData.sortOrder || null,
      createdAt: new Date()
    };
  }

  async getMemoryMedia(memoryId: number): Promise<any[]> {
    // Placeholder implementation - memory_media table structure needs verification
    return [];
  }

  async deleteMemoryMedia(id: number): Promise<void> {
    // Placeholder implementation - memory_media table structure needs verification
  }

  async getEventRoleInvitation(eventId: number, userId: number): Promise<EventParticipant | undefined> {
    const result = await db
      .select()
      .from(eventParticipants)
      .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, userId)))
      .limit(1);
    return result[0];
  }

  async getEventParticipants(eventId: number): Promise<EventParticipant[]> {
    return await db
      .select()
      .from(eventParticipants)
      .where(eq(eventParticipants.eventId, eventId));
  }

  async getUserEventInvitations(userId: number): Promise<EventParticipant[]> {
    return await db
      .select()
      .from(eventParticipants)
      .where(eq(eventParticipants.userId, userId));
  }

  async updateEventParticipantStatus(id: number, status: string): Promise<EventParticipant> {
    const [updated] = await db
      .update(eventParticipants)
      .set({ status, updatedAt: new Date() })
      .where(eq(eventParticipants.id, id))
      .returning();
    return updated;
  }

  async getUserAcceptedRoles(userId: number): Promise<EventParticipant[]> {
    return await db
      .select()
      .from(eventParticipants)
      .where(and(eq(eventParticipants.userId, userId), eq(eventParticipants.status, 'accepted')));
  }

  async createComment(comment: InsertComment): Promise<PostComment> {
    return this.commentOnPost(comment.postId, comment.userId, comment.content);
  }

  async getCommentsByPostId(postId: number): Promise<PostComment[]> {
    return this.getPostComments(postId);
  }

  async createReaction(reaction: any): Promise<any> {
    const [newReaction] = await db.insert(postLikes).values(reaction).returning();
    return newReaction;
  }

  async removeReaction(postId: number, userId: number): Promise<void> {
    return this.unlikePost(postId, userId);
  }

  async createReport(report: any): Promise<any> {
    // Placeholder for reports table - not implemented in current schema
    return { id: 1, ...report, createdAt: new Date() };
  }

  async getNotificationsByUserId(userId: number): Promise<any[]> {
    // Placeholder for notifications table - not implemented in current schema
    return [];
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    // Placeholder for notifications table - not implemented in current schema
  }

  // Enhanced post features implementation
  async createCommentWithMentions(comment: InsertComment & { mentions?: string[] }): Promise<PostComment> {
    const [newComment] = await db.insert(postComments).values({
      ...comment,
      mentions: comment.mentions || []
    }).returning();
    return newComment;
  }

  async updateComment(id: number, updates: Partial<PostComment>): Promise<PostComment> {
    const [updatedComment] = await db.update(postComments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(postComments.id, id))
      .returning();
    return updatedComment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(postComments).where(eq(postComments.id, id));
  }

  async createPostReaction(postId: number, userId: number, reactionType: string): Promise<any> {
    // Placeholder implementation - would use post_reactions table
    return { id: 1, postId, userId, reactionType, createdAt: new Date() };
  }

  async getPostReactions(postId: number): Promise<any[]> {
    // Placeholder implementation - would query post_reactions table
    return [];
  }

  async upsertPostReaction(postId: number, userId: number, reactionType: string): Promise<any> {
    // Placeholder implementation - would use ON CONFLICT for upsert
    return { id: 1, postId, userId, reactionType, createdAt: new Date() };
  }

  async createNotification(userId: number, type: string, title: string, message: string, data?: any): Promise<any> {
    // Placeholder implementation - would use notifications table
    return { id: 1, userId, type, title, message, data, isRead: false, createdAt: new Date() };
  }

  async createPostReport(postId: number, reporterId: number, reason: string, description?: string): Promise<any> {
    // Placeholder implementation - would use post_reports table
    return { id: 1, postId, reporterId, reason, description, status: 'pending', createdAt: new Date() };
  }

  async getPostsByLocation(lat: number, lng: number, radiusKm: number = 10): Promise<Post[]> {
    // Placeholder implementation - would use PostGIS for location queries
    return this.getFeedPosts(1, 20);
  }

  async getPostsByHashtags(hashtags: string[]): Promise<Post[]> {
    // Query posts that contain any of the specified hashtags
    const result = await db.select().from(posts)
      .where(sql`${posts.hashtags} && ${hashtags}`)
      .orderBy(desc(posts.createdAt))
      .limit(50);
    return result;
  }

  async getPostsByMentions(username: string): Promise<Post[]> {
    // Query posts that mention the specified username
    const result = await db.select().from(posts)
      .where(sql`${posts.mentions} @> ${[username]}`)
      .orderBy(desc(posts.createdAt))
      .limit(50);
    return result;
  }

  async updatePostEngagement(postId: number): Promise<void> {
    // Placeholder implementation - would update engagement metrics
    console.log(`Updated engagement for post ${postId}`);
  }

  async markCommentsAsRead(postId: number, userId: number): Promise<void> {
    // Placeholder implementation - would mark comments as read for user
    console.log(`Marked comments as read for post ${postId} by user ${userId}`);
  }
}

export const storage = new DatabaseStorage();