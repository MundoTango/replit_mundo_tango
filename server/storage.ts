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
  groups,
  groupMembers,
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
  type Group,
  type InsertGroup,
  type GroupMember,
  type InsertGroupMember,
  type InsertCustomRoleRequest,
  type UpdateCustomRoleRequest
} from '../shared/schema';
import { db, pool } from './db';
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

  // Layer 2/3: Memory System Backend Methods
  getUserMemoryRoles(userId: number): Promise<any[]>;
  getUserActiveRole(userId: number): Promise<any>;
  setUserActiveRole(userId: number, roleId: string): Promise<void>;
  getMemoryPermissions(userId: number): Promise<any>;
  getUserTrustCircles(userId: number): Promise<any[]>;
  createMemory(memoryData: any): Promise<any>;
  logMemoryAudit(auditData: any): Promise<void>;

  // Layer 9: Consent Approval System Methods
  getPendingConsentMemories(userId: number): Promise<any[]>;
  createConsentEvent(memoryId: string, userId: number, action: string, reason?: string, metadata?: any): Promise<any>;
  updateMemoryConsentStatus(memoryId: string): Promise<any>;
  getUserMemoriesWithFilters(userId: number, filters: any): Promise<any[]>;
  getMemoryById(memoryId: string): Promise<any>;
  checkAllConsentDecisions(memoryId: string): Promise<{ approved: number[], denied: number[], pending: number[] }>;

  // City Group Automation Methods
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(groupId: number, updates: Partial<Group>): Promise<Group>;
  getGroupBySlug(slug: string): Promise<Group | undefined>;
  getGroupsByCity(city: string): Promise<Group[]>;
  addUserToGroup(groupId: number, userId: number, role?: string): Promise<GroupMember>;
  removeUserFromGroup(groupId: number, userId: number): Promise<void>;
  updateGroupMemberCount(groupId: number): Promise<void>;
  getUserGroups(userId: number): Promise<Group[]>;
  checkUserInGroup(groupId: number, userId: number): Promise<boolean>;
  followGroup(groupId: number, userId: number): Promise<void>;
  unfollowGroup(groupId: number, userId: number): Promise<void>;
  checkUserFollowingGroup(groupId: number, userId: number): Promise<boolean>;
  
  // Group page methods
  getGroupWithMembers(slug: string): Promise<(Group & { members: (GroupMember & { user: User })[] }) | undefined>;
  getGroupRecentMemories(groupId: number, limit?: number): Promise<any[]>;
  getGroupUpcomingEvents(groupId: number, limit?: number): Promise<any[]>;
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

  // Layer 2/3: Memory System Implementation
  async getUserMemoryRoles(userId: number): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: roles.id,
          name: roles.name,
          permissions: roles.permissions,
          memory_access_level: roles.memoryAccessLevel,
          emotional_tag_access: roles.emotionalTagAccess
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId));
      
      return result;
    } catch (error) {
      console.error('Error fetching user memory roles:', error);
      return [];
    }
  }

  async getUserActiveRole(userId: number): Promise<any> {
    try {
      // Get user's primary role or first assigned role
      const result = await db
        .select({
          id: roles.id,
          name: roles.name,
          permissions: roles.permissions,
          memory_access_level: roles.memoryAccessLevel,
          emotional_tag_access: roles.emotionalTagAccess
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(and(eq(userRoles.userId, userId), eq(userRoles.isPrimary, true)))
        .limit(1);
      
      if (result.length > 0) {
        return result[0];
      }

      // Fallback to first role if no primary role set
      const fallback = await db
        .select({
          id: roles.id,
          name: roles.name,
          permissions: roles.permissions,
          memory_access_level: roles.memoryAccessLevel,
          emotional_tag_access: roles.emotionalTagAccess
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId))
        .limit(1);
      
      return fallback[0] || null;
    } catch (error) {
      console.error('Error fetching user active role:', error);
      return null;
    }
  }

  async setUserActiveRole(userId: number, roleId: string): Promise<void> {
    try {
      // Reset all roles to non-primary
      await db
        .update(userRoles)
        .set({ isPrimary: false })
        .where(eq(userRoles.userId, userId));
      
      // Set specified role as primary
      await db
        .update(userRoles)
        .set({ isPrimary: true })
        .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
    } catch (error) {
      console.error('Error setting user active role:', error);
      throw error;
    }
  }

  async getMemoryPermissions(userId: number): Promise<any> {
    try {
      // Get counts of accessible memories by visibility type
      const publicCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(sql`memories`)
        .where(sql`emotion_visibility = 'public'`);
      
      const friendsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(sql`memories`)
        .where(sql`emotion_visibility = 'friends'`);
      
      const trustedCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(sql`memories`)
        .where(sql`emotion_visibility = 'trusted'`);
      
      const privateCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(sql`memories`)
        .where(sql`user_id = ${userId} AND emotion_visibility = 'private'`);

      return {
        publicCount: publicCount[0]?.count || 0,
        friendsCount: friendsCount[0]?.count || 0,
        trustedCount: trustedCount[0]?.count || 0,
        privateCount: privateCount[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching memory permissions:', error);
      return { publicCount: 0, friendsCount: 0, trustedCount: 0, privateCount: 0 };
    }
  }

  async getUserTrustCircles(userId: number): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: sql`trust_circles.id`,
          trusted_user_id: sql`trust_circles.trusted_user_id`,
          trusted_user_name: sql`users.username`,
          circle_name: sql`trust_circles.circle_name`,
          trust_level: sql`trust_circles.trust_level`,
          emotional_access_level: sql`trust_circles.emotional_access_level`,
          granted_at: sql`trust_circles.granted_at`
        })
        .from(sql`trust_circles`)
        .innerJoin(sql`users`, sql`trust_circles.trusted_user_id = users.id`)
        .where(sql`trust_circles.user_id = ${userId}`);
      
      return result;
    } catch (error) {
      console.error('Error fetching trust circles:', error);
      return [];
    }
  }

  async createMemory(memoryData: any): Promise<any> {
    try {
      const result = await db
        .insert(sql`memories`)
        .values({
          id: sql`gen_random_uuid()::text`,
          user_id: memoryData.user_id,
          title: memoryData.title,
          content: memoryData.content,
          emotion_tags: memoryData.emotion_tags,
          emotion_visibility: memoryData.emotion_visibility,
          trust_circle_level: memoryData.trust_circle_level,
          location: memoryData.location,
          media_urls: memoryData.media_urls,
          co_tagged_users: memoryData.co_tagged_users,
          consent_required: memoryData.consent_required
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating memory:', error);
      throw error;
    }
  }

  async logMemoryAudit(auditData: any): Promise<void> {
    try {
      await db
        .insert(sql`memory_audit_logs`)
        .values({
          id: sql`gen_random_uuid()::text`,
          user_id: auditData.user_id,
          memory_id: auditData.memory_id || null,
          action_type: auditData.action_type,
          result: auditData.result,
          reason: auditData.reason || null,
          metadata: JSON.stringify(auditData.metadata || {}),
          ip_address: auditData.ip_address || null,
          user_agent: auditData.user_agent || null
        });
    } catch (error) {
      console.error('Error logging memory audit:', error);
      // Don't throw error for audit logging to avoid breaking main functionality
    }
  }

  // Layer 9: Consent Approval System Implementation
  async getPendingConsentMemories(userId: number): Promise<any[]> {
    try {
      const results = await db
        .select({
          id: sql<string>`m.id`,
          title: sql<string>`m.title`,
          content: sql<string>`m.content`,
          emotionTags: sql<string[]>`m.emotion_tags`,
          trustLevel: sql<string>`CASE 
            WHEN m.trust_circle_level = 1 THEN 'basic'
            WHEN m.trust_circle_level = 2 THEN 'close'
            WHEN m.trust_circle_level = 3 THEN 'intimate'
            WHEN m.trust_circle_level = 4 THEN 'sacred'
            ELSE 'basic'
          END`,
          createdAt: sql<string>`m.created_at::text`,
          eventId: sql<string>`m.event_id`,
          eventTitle: sql<string>`e.title`,
          location: sql<string>`m.location::text`,
          creatorId: sql<number>`u.id`,
          creatorName: sql<string>`u.name`,
          creatorUsername: sql<string>`u.username`,
          creatorProfileImage: sql<string>`u.profile_image`,
          coTags: sql<number[]>`m.co_tagged_users`,
          previewText: sql<string>`SUBSTRING(m.content, 1, 200)`
        })
        .from(sql`memories m`)
        .leftJoin(sql`events e`, sql`e.id = m.event_id`)
        .leftJoin(sql`users u`, sql`u.id = m.user_id`)
        .where(sql`${userId} = ANY(m.co_tagged_users) AND (m.consent_status = 'pending' OR m.consent_status IS NULL)`)
        .orderBy(sql`m.created_at DESC`);

      return results.map(result => ({
        id: result.id,
        title: result.title,
        content: result.content,
        emotionTags: result.emotionTags || [],
        trustLevel: result.trustLevel,
        createdAt: result.createdAt,
        eventId: result.eventId,
        eventTitle: result.eventTitle,
        location: result.location,
        creator: {
          id: result.creatorId,
          name: result.creatorName,
          username: result.creatorUsername,
          profileImage: result.creatorProfileImage
        },
        coTags: result.coTags || [],
        previewText: result.previewText
      }));
    } catch (error) {
      console.error('Error fetching pending consent memories:', error);
      return [];
    }
  }

  async createConsentEvent(memoryId: string, userId: number, action: string, reason?: string, metadata?: any): Promise<any> {
    try {
      const consentEvent = await db
        .insert(sql`consent_events`)
        .values({
          id: sql`gen_random_uuid()::text`,
          memory_id: memoryId,
          user_id: userId,
          action,
          reason: reason || null,
          metadata: JSON.stringify(metadata || {}),
          ip_address: metadata?.ip_address || null,
          user_agent: metadata?.user_agent || null
        })
        .returning({
          id: sql<string>`id`,
          memory_id: sql<string>`memory_id`,
          user_id: sql<number>`user_id`,
          action: sql<string>`action`,
          timestamp: sql<string>`timestamp::text`
        });

      return consentEvent[0];
    } catch (error) {
      console.error('Error creating consent event:', error);
      throw error;
    }
  }

  async updateMemoryConsentStatus(memoryId: string): Promise<any> {
    try {
      // Get all consent decisions for this memory
      const decisions = await this.checkAllConsentDecisions(memoryId);
      
      let newStatus = 'pending';
      if (decisions.denied.length > 0) {
        newStatus = 'denied';
      } else if (decisions.pending.length === 0 && decisions.approved.length > 0) {
        newStatus = 'granted';
      } else if (decisions.approved.length > 0 && decisions.pending.length > 0) {
        newStatus = 'partial';
      }

      // Update memory consent status
      const updatedMemory = await db
        .update(sql`memories`)
        .set({
          consent_status: newStatus,
          approved_consents: JSON.stringify(decisions.approved),
          denied_consents: JSON.stringify(decisions.denied),
          pending_consents: JSON.stringify(decisions.pending)
        })
        .where(sql`id = ${memoryId}`)
        .returning({
          id: sql<string>`id`,
          consent_status: sql<string>`consent_status`
        });

      return updatedMemory[0];
    } catch (error) {
      console.error('Error updating memory consent status:', error);
      throw error;
    }
  }

  async checkAllConsentDecisions(memoryId: string): Promise<{ approved: number[], denied: number[], pending: number[] }> {
    try {
      // Get the memory and its co-tagged users
      const memoryResult = await db
        .select({
          coTags: sql<number[]>`co_tagged_users`
        })
        .from(sql`memories`)
        .where(sql`id = ${memoryId}`)
        .limit(1);

      if (!memoryResult[0]) {
        return { approved: [], denied: [], pending: [] };
      }

      const coTaggedUsers = memoryResult[0].coTags || [];
      
      // Get all consent events for this memory
      const consentEvents = await db
        .select({
          user_id: sql<number>`user_id`,
          action: sql<string>`action`,
          timestamp: sql<string>`timestamp::text`
        })
        .from(sql`consent_events`)
        .where(sql`memory_id = ${memoryId}`)
        .orderBy(sql`timestamp DESC`);

      // Track latest decision for each user
      const userDecisions: { [key: number]: string } = {};
      consentEvents.forEach(event => {
        if (!userDecisions[event.user_id]) {
          userDecisions[event.user_id] = event.action;
        }
      });

      // Categorize users by their consent status
      const approved: number[] = [];
      const denied: number[] = [];
      const pending: number[] = [];

      coTaggedUsers.forEach(userId => {
        const decision = userDecisions[userId];
        if (decision === 'approve') {
          approved.push(userId);
        } else if (decision === 'deny') {
          denied.push(userId);
        } else {
          pending.push(userId);
        }
      });

      return { approved, denied, pending };
    } catch (error) {
      console.error('Error checking consent decisions:', error);
      return { approved: [], denied: [], pending: [] };
    }
  }

  async getUserMemoriesWithFilters(userId: number, filters: any): Promise<any[]> {
    try {
      let whereConditions = [`m.user_id = ${userId}`];
      
      // Add emotion tags filter
      if (filters.emotions && filters.emotions.length > 0) {
        whereConditions.push(`m.emotion_tags && ARRAY[${filters.emotions.map((e: string) => `'${e}'`).join(',')}]::TEXT[]`);
      }
      
      // Add date range filter
      if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
        whereConditions.push(`m.created_at BETWEEN '${filters.dateRange.start}' AND '${filters.dateRange.end}'`);
      }
      
      // Add event filter
      if (filters.event) {
        whereConditions.push(`m.event_id = ${filters.event}`);
      }

      const whereClause = whereConditions.join(' AND ');

      const results = await db
        .select({
          id: sql<string>`m.id`,
          title: sql<string>`m.title`,
          content: sql<string>`m.content`,
          emotionTags: sql<string[]>`m.emotion_tags`,
          trustLevel: sql<number>`m.trust_circle_level`,
          createdAt: sql<string>`m.created_at::text`,
          eventId: sql<string>`m.event_id`,
          eventTitle: sql<string>`e.title`,
          location: sql<string>`m.location::text`,
          consentStatus: sql<string>`m.consent_status`
        })
        .from(sql`memories m`)
        .leftJoin(sql`events e`, sql`e.id = m.event_id`)
        .where(sql.raw(whereClause))
        .orderBy(sql`m.created_at DESC`);

      return results;
    } catch (error) {
      console.error('Error fetching user memories with filters:', error);
      return [];
    }
  }

  async getMemoryById(memoryId: string): Promise<any> {
    try {
      const result = await db
        .select({
          id: sql<string>`m.id`,
          title: sql<string>`m.title`,
          content: sql<string>`m.content`,
          emotionTags: sql<string[]>`m.emotion_tags`,
          trustLevel: sql<number>`m.trust_circle_level`,
          createdAt: sql<string>`m.created_at::text`,
          eventId: sql<string>`m.event_id`,
          location: sql<string>`m.location::text`,
          coTags: sql<number[]>`m.co_tagged_users`,
          consentStatus: sql<string>`m.consent_status`,
          userId: sql<number>`m.user_id`
        })
        .from(sql`memories m`)
        .where(sql`m.id = ${memoryId}`)
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error fetching memory by ID:', error);
      return null;
    }
  }

  // City Group Automation Implementation
  async createGroup(group: InsertGroup): Promise<Group> {
    const result = await db.insert(groups).values(group).returning();
    return result[0];
  }

  async updateGroup(groupId: number, updates: Partial<Group>): Promise<Group> {
    const result = await db.update(groups)
      .set(updates)
      .where(eq(groups.id, groupId))
      .returning();
    return result[0];
  }

  async getGroupBySlug(slug: string): Promise<Group | undefined> {
    const result = await db.select().from(groups).where(eq(groups.slug, slug)).limit(1);
    return result[0];
  }

  async getGroupsByCity(city: string): Promise<Group[]> {
    return await db.select().from(groups).where(and(eq(groups.city, city), eq(groups.type, 'city')));
  }

  async getAllGroups(): Promise<Group[]> {
    return await db.select().from(groups).orderBy(desc(groups.createdAt));
  }

  async followGroup(groupId: number, userId: number): Promise<void> {
    await pool.query(
      'INSERT INTO group_followers (user_id, group_id) VALUES ($1, $2) ON CONFLICT (user_id, group_id) DO NOTHING',
      [userId, groupId]
    );
  }

  async unfollowGroup(groupId: number, userId: number): Promise<void> {
    await pool.query(
      'DELETE FROM group_followers WHERE user_id = $1 AND group_id = $2',
      [userId, groupId]
    );
  }

  async checkUserFollowingGroup(groupId: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM group_followers WHERE user_id = $1 AND group_id = $2',
      [userId, groupId]
    );
    return result.rows.length > 0;
  }

  async addUserToGroup(groupId: number, userId: number, role: string = 'member'): Promise<GroupMember> {
    // Check if user is already in group
    const existing = await db.select().from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
      .limit(1);
    
    if (existing.length > 0) {
      return existing[0];
    }

    // Add user to group
    const result = await db.insert(groupMembers).values({
      groupId,
      userId,
      role,
      status: 'active'
    }).returning();

    // Update member count
    await this.updateGroupMemberCount(groupId);
    
    return result[0];
  }

  async removeUserFromGroup(groupId: number, userId: number): Promise<void> {
    await db.delete(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
    
    // Update member count
    await this.updateGroupMemberCount(groupId);
  }

  async updateGroupMemberCount(groupId: number): Promise<void> {
    const count = await db.select({ count: sql<number>`count(*)` })
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.status, 'active')));
    
    await db.update(groups)
      .set({ memberCount: count[0].count })
      .where(eq(groups.id, groupId));
  }

  async getUserGroups(userId: number): Promise<Group[]> {
    const result = await db.select({
      id: groups.id,
      name: groups.name,
      slug: groups.slug,
      type: groups.type,
      emoji: groups.emoji,
      imageUrl: groups.imageUrl,
      description: groups.description,
      isPrivate: groups.isPrivate,
      city: groups.city,
      country: groups.country,
      memberCount: groups.memberCount,
      createdBy: groups.createdBy,
      createdAt: groups.createdAt,
      updatedAt: groups.updatedAt,
    })
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(and(eq(groupMembers.userId, userId), eq(groupMembers.status, 'active')));
    
    return result;
  }

  async checkUserInGroup(groupId: number, userId: number): Promise<boolean> {
    const result = await db.select().from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId), 
        eq(groupMembers.userId, userId),
        eq(groupMembers.status, 'active')
      ))
      .limit(1);
    
    return result.length > 0;
  }

  async getGroupWithMembers(slug: string): Promise<any> {
    try {
      const query = `
        SELECT id, name, slug, type, emoji, image_url, 
               description, is_private, city, country, 
               member_count, created_by, created_at, updated_at
        FROM groups 
        WHERE slug = $1 
        LIMIT 1
      `;
      
      console.log('Executing query with slug:', slug);
      const result = await pool.query(query, [slug]);
      console.log('Query result rows count:', result.rows?.length || 0);
      
      if (!result.rows || result.rows.length === 0) {
        return undefined;
      }

      const group = result.rows[0];

      // Transform to camelCase format expected by frontend
      return {
        id: group.id,
        name: group.name,
        slug: group.slug,
        type: group.type,
        emoji: group.emoji,
        imageUrl: group.image_url,
        description: group.description,
        isPrivate: group.is_private,
        city: group.city,
        country: group.country,
        memberCount: group.member_count,
        createdBy: group.created_by,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        members: []
      };
    } catch (error) {
      console.error('Error in getGroupWithMembers:', error);
      return undefined;
    }
  }

  async getGroupRecentMemories(groupId: number, limit = 10): Promise<any[]> {
    // For now, return empty array since memories table may not be connected to groups yet
    // This can be expanded when memories have group associations
    return [];
  }

  async getGroupUpcomingEvents(groupId: number, limit = 5): Promise<any[]> {
    try {
      // For now, return empty array to avoid schema issues
      // This can be implemented properly once schema mismatches are resolved
      return [];
    } catch (error) {
      console.error('Error in getGroupUpcomingEvents:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();