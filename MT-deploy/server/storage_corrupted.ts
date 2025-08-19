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
  type UserFollowedCity,
  type InsertUserFollowedCity,
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
  type InsertComment,
  type Story
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
  
  // Replit Auth operations
  getUserByReplitId(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateOnboardingStatus(id: number, formStatus: number, isComplete: boolean): Promise<User>;
  
  // Event RSVP operations
  getUserEventRsvps(userId: number): Promise<EventRsvp[]>;
  getUserFollowedCities(userId: number): Promise<{ id: number; city: string; country: string; userId: number; createdAt: Date | null }[]>;
  addFollowedCity(userId: number, city: string, country: string): Promise<{ id: number; city: string; country: string; userId: number; createdAt: Date | null }>;
  removeFollowedCity(userId: number, cityId: number): Promise<void>;
  
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
  
  // Personalized event queries
  getPersonalizedEvents(userId: number, options?: {
    filter?: string;
    timeframe?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<Event[]>;
  
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
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserApiToken(id: number, token: string): Promise<void> {
    await db.update(users).set({ apiToken: token }).where(eq(users.id, id));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async createEnhancedPost(data: {
    userId: number;
    content: string;
    richContent?: any;
    mediaUrls: string[];
    location?: string;
    visibility: boolean;
    hashtags: string[];
    socialEmbeds: string[];
    mentions: string[];
  }): Promise<Post> {
    const postData: InsertPost = {
      userId: data.userId,
      content: data.content,
      location: data.location,
      isPublic: data.visibility,
      imageUrl: data.mediaUrls.length > 0 ? data.mediaUrls[0] : null,
      videoUrl: data.mediaUrls.find(url => url.includes('.mp4') || url.includes('.mov')) || null
    };

    const [newPost] = await db.insert(posts).values(postData).returning();
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

    // Complex filtering query for posts with specific tags
    return await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        richContent: posts.richContent,
        plainText: posts.plainText,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        mediaEmbeds: posts.mediaEmbeds,
        mentions: posts.mentions,
        hashtags: posts.hashtags,
        location: posts.location,
        coordinates: posts.coordinates,
        placeId: posts.placeId,
        formattedAddress: posts.formattedAddress,
        visibility: posts.visibility,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        sharesCount: posts.sharesCount,
        isPublic: posts.isPublic,
        isEdited: posts.isEdited,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt
      })
      .from(posts)
      .innerJoin(memoryMedia, eq(posts.id, memoryMedia.memoryId))
      .innerJoin(mediaTags, eq(memoryMedia.mediaId, mediaTags.mediaId))
      .where(inArray(mediaTags.tag, filterTags))
      .groupBy(posts.id)
      .having(sql`COUNT(DISTINCT ${mediaTags.tag}) = ${filterTags.length}`)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async likePost(postId: number, userId: number): Promise<void> {
    await db.insert(postLikes).values({ postId, userId }).onConflictDoNothing();
  }

  async unlikePost(postId: number, userId: number): Promise<void> {
    await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
  }

  async commentOnPost(postId: number, userId: number, content: string): Promise<PostComment> {
    const [comment] = await db.insert(postComments).values({ postId, userId, content }).returning();
    return comment;
  }

  async getPostComments(postId: number): Promise<PostComment[]> {
    return await db.select().from(postComments).where(eq(postComments.postId, postId)).orderBy(asc(postComments.createdAt));
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
    return await db.select().from(events).orderBy(desc(events.startDate)).limit(limit).offset(offset);
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.userId, userId)).orderBy(desc(events.startDate));
  }

  async rsvpEvent(eventId: number, userId: number, status: string): Promise<EventRsvp> {
    const [rsvp] = await db
      .insert(eventRsvps)
      .values({ eventId, userId, status })
      .onConflictDoUpdate({
        target: [eventRsvps.eventId, eventRsvps.userId],
        set: { status, createdAt: sql`NOW()` }
      })
      .returning();
    return rsvp;
  }

  async getEventRsvps(eventId: number): Promise<EventRsvp[]> {
    return await db.select().from(eventRsvps).where(eq(eventRsvps.eventId, eventId));
  }

  async getUserEventRsvps(userId: number): Promise<EventRsvp[]> {
    return await db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.userId, userId));
  }

  async getUserFollowedCities(userId: number): Promise<{ id: number; city: string; country: string; userId: number; createdAt: Date | null }[]> {
    return await db.select().from(userFollowedCities).where(eq(userFollowedCities.userId, userId));
  }

  async addFollowedCity(userId: number, city: string, country: string): Promise<{ id: number; city: string; country: string; userId: number; createdAt: Date | null }> {
    const [result] = await db.insert(userFollowedCities).values({
      userId,
      city,
      country
    }).returning();
    return result;
  }

  async removeFollowedCity(userId: number, cityId: number): Promise<void> {
    await db.delete(userFollowedCities).where(and(eq(userFollowedCities.id, cityId), eq(userFollowedCities.userId, userId)));
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
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
    
    return result;
  }

  async getFollowing(userId: number): Promise<User[]> {
    const result = await db
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
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
    
    return result;
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return result[0].count > 0;
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const [chatRoom] = await db.insert(chatRooms).values(room).returning();
    return chatRoom;
  }

  async getChatRoom(slug: string): Promise<ChatRoom | undefined> {
    const result = await db.select().from(chatRooms).where(eq(chatRooms.slug, slug)).limit(1);
    return result[0];
  }

  async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
    return await db
      .select()
      .from(chatRooms)
      .innerJoin(chatRoomUsers, eq(chatRooms.slug, chatRoomUsers.chatRoomSlug))
      .where(eq(chatRoomUsers.userSlug, userId.toString()));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db.insert(chatMessages).values(message).returning();
    return chatMessage;
  }

  async getChatMessages(roomSlug: string, limit = 50): Promise<ChatMessage[]> {
    const room = await this.getChatRoom(roomSlug);
    if (!room) throw new Error('Chat room not found');
    
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatRoomSlug, roomSlug))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createStory(userId: number, mediaUrl: string, mediaType: string, caption?: string): Promise<Story> {
    const [story] = await db.insert(stories).values({
      userId,
      mediaUrl,
      mediaType,
      caption
    }).returning();
    return story;
  }

  async getActiveStories(userId: number): Promise<Story[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await db
      .select()
      .from(stories)
      .where(and(eq(stories.userId, userId), gte(stories.createdAt, oneDayAgo)))
      .orderBy(desc(stories.createdAt));
  }

  async getFollowingStories(userId: number): Promise<Story[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await db
      .select()
      .from(stories)
      .innerJoin(follows, eq(stories.userId, follows.followingId))
      .where(and(eq(follows.followerId, userId), gte(stories.createdAt, oneDayAgo)))
      .orderBy(desc(stories.createdAt));
  }

  async viewStory(storyId: number, userId: number): Promise<void> {
    await db.insert(storyViews).values({ storyId, userId }).onConflictDoNothing();
  }

  async searchUsers(query: string, limit = 20): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(or(
        ilike(users.name, `%${query}%`),
        ilike(users.username, `%${query}%`)
      ))
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
    // Use email as fallback since replitId column doesn't exist
    const result = await db.select().from(users).where(eq(users.email, id)).limit(1);
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
        target: users.email,
        set: {
          name: userData.name,
          username: userData.username,
          profileImage: userData.profileImage,
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
    let query = db.select().from(mediaAssets).where(eq(mediaAssets.userId, userId));
    
    if (folder) {
      query = query.where(eq(mediaAssets.folder, folder));
    }
    
    return await query.orderBy(desc(mediaAssets.createdAt)).limit(limit);
  }

  async updateMediaAsset(id: string, updates: Partial<MediaAsset>): Promise<MediaAsset> {
    const [asset] = await db.update(mediaAssets).set(updates).where(eq(mediaAssets.id, id)).returning();
    return asset;
  }

  async deleteMediaAsset(id: string): Promise<void> {
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  }

  async addMediaTag(mediaId: string, tag: string): Promise<void> {
    await db.insert(mediaTags).values({ mediaId, tag }).onConflictDoNothing();
  }

  async removeMediaTag(mediaId: string, tag: string): Promise<void> {
    await db.delete(mediaTags).where(and(eq(mediaTags.mediaId, mediaId), eq(mediaTags.tag, tag)));
  }

  async getMediaTags(mediaId: string): Promise<string[]> {
    const result = await db.select({ tag: mediaTags.tag }).from(mediaTags).where(eq(mediaTags.mediaId, mediaId));
    return result.map(r => r.tag);
  }

  async searchMediaByTag(tag: string, limit = 20): Promise<MediaAsset[]> {
    return await db
      .select()
      .from(mediaAssets)
      .innerJoin(mediaTags, eq(mediaAssets.id, mediaTags.mediaId))
      .where(eq(mediaTags.tag, tag))
      .limit(limit);
  }

  async createMediaUsage(usage: InsertMediaUsage): Promise<MediaUsage> {
    const [mediaUsage] = await db.insert(mediaUsage).values(usage).returning();
    return mediaUsage;
  }

  async getMediaUsage(mediaId: string): Promise<MediaUsage[]> {
    return await db.select().from(mediaUsage).where(eq(mediaUsage.mediaId, mediaId));
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

  async createFriendship(friendship: InsertFriend): Promise<Friend> {
    const [friend] = await db.insert(friends).values(friendship).returning();
    return friend;
  }

  async getFriends(userId: number): Promise<User[]> {
    const result = await db
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
      .where(and(eq(friends.userId, userId), eq(friends.status, 'accepted')));
    
    return result;
  }

  async getMutualFriends(userId1: number, userId2: number): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(friends)
      .where(
        and(
          eq(friends.userId, userId1),
          eq(friends.friendId, userId2),
          eq(friends.status, 'accepted')
        )
      );
    return result[0].count > 0;
  }

  async updateFriendshipStatus(userId: number, friendId: number, status: string): Promise<Friend> {
    const [friendship] = await db
      .update(friends)
      .set({ status })
      .where(and(eq(friends.userId, userId), eq(friends.friendId, friendId)))
      .returning();
    return friendship;
  }

  async deleteFriendship(userId: number, friendId: number): Promise<void> {
    await db
      .delete(friends)
      .where(and(eq(friends.userId, userId), eq(friends.friendId, friendId)));
  }

  async createEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant> {
    const [eventParticipant] = await db.insert(eventParticipants).values(participant).returning();
    return eventParticipant;
  }

  async getUserEventInvitations(userId: number, status?: string): Promise<EventParticipant[]> {
    let query = db.select().from(eventParticipants).where(eq(eventParticipants.userId, userId));
    
    if (status) {
      query = query.where(eq(eventParticipants.status, status));
    }
    
    return await query.orderBy(desc(eventParticipants.invitedAt));
  }

  async getEventParticipants(eventId: number, status?: string): Promise<EventParticipant[]> {
    let query = db.select().from(eventParticipants).where(eq(eventParticipants.eventId, eventId));
    
    if (status) {
      query = query.where(eq(eventParticipants.status, status));
    }
    
    return await query.orderBy(desc(eventParticipants.invitedAt));
  }

  async updateEventParticipantStatus(participantId: number, status: string, userId: number): Promise<EventParticipant> {
    const [participant] = await db
      .update(eventParticipants)
      .set({ status, respondedAt: sql`NOW()` })
      .where(and(eq(eventParticipants.id, participantId), eq(eventParticipants.userId, userId)))
      .returning();
    return participant;
  }

  async getUserAcceptedRoles(userId: number): Promise<EventParticipant[]> {
    return await db
      .select()
      .from(eventParticipants)
      .where(and(eq(eventParticipants.userId, userId), eq(eventParticipants.status, 'accepted')))
      .orderBy(desc(eventParticipants.respondedAt));
  }

  async getEventRoleInvitation(eventId: number, userId: number, role: string): Promise<EventParticipant | undefined> {
    const result = await db
      .select()
      .from(eventParticipants)
      .where(and(
        eq(eventParticipants.eventId, eventId),
        eq(eventParticipants.userId, userId),
        eq(eventParticipants.role, role)
      ))
      .limit(1);
    return result[0];
  }

  async createMemoryMedia(memoryMediaData: InsertMemoryMedia): Promise<MemoryMedia> {
    const [memoryMedia] = await db.insert(memoryMedia).values(memoryMediaData).returning();
    return memoryMedia;
  }

  async getMemoryMedia(memoryId: number): Promise<(MemoryMedia & { mediaUrl: string, originalFilename: string, contentType: string })[]> {
    return await db
      .select({
        id: memoryMedia.id,
        memoryId: memoryMedia.memoryId,
        mediaId: memoryMedia.mediaId,
        caption: memoryMedia.caption,
        sortOrder: memoryMedia.sortOrder,
        createdAt: memoryMedia.createdAt,
        mediaUrl: mediaAssets.url,
        originalFilename: mediaAssets.originalFilename,
        contentType: mediaAssets.contentType
      })
      .from(memoryMedia)
      .innerJoin(mediaAssets, eq(memoryMedia.mediaId, mediaAssets.id))
      .where(eq(memoryMedia.memoryId, memoryId))
      .orderBy(asc(memoryMedia.sortOrder));
  }

  async getUserMedia(userId: number, limit: number = 50): Promise<MediaAsset[]> {
    return await db
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
        eq(memoryMedia.mediaId, mediaId)
      ))
      .returning();
    return result.length > 0;
  }

  async getPersonalizedEvents(userId: number, options?: {
    filter?: string;
    timeframe?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<Event[]> {
    const { filter = 'all', timeframe = 'all', searchQuery = '', limit = 20, offset = 0 } = options || {};
    
    let query = db
      .select({
        id: events.id,
        userId: events.userId,
        title: events.title,
        description: events.description,
        imageUrl: events.imageUrl,
        eventType: events.eventType,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        isPublic: events.isPublic,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        attendeeCount: sql<number>`COALESCE(rsvp_counts.going_count, 0)`,
        userStatus: sql<string | null>`user_rsvp.status`
      })
      .from(events)
      .leftJoin(
        sql`(
          SELECT event_id, 
                 COUNT(CASE WHEN status = 'going' THEN 1 END) as going_count
          FROM event_rsvps 
          GROUP BY event_id
        ) as rsvp_counts`,
        sql`events.id = rsvp_counts.event_id`
      )
      .leftJoin(
        sql`event_rsvps as user_rsvp`,
        sql`events.id = user_rsvp.event_id AND user_rsvp.user_id = ${userId}`
      );

    // Apply filters
    if (filter === 'my_events') {
      query = query.where(eq(events.userId, userId));
    } else if (filter === 'attending') {
      query = query.where(sql`user_rsvp.status = 'going'`);
    } else if (filter === 'nearby') {
      const userCities = await this.getUserFollowedCities(userId);
      if (userCities.length > 0) {
        const cityNames = userCities.map(city => city.city);
        query = query.where(
          or(...cityNames.map(city => ilike(events.location, `%${city}%`)))
        );
      }
    }

    // Apply timeframe filter
    const now = new Date();
    if (timeframe === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query = query.where(and(gte(events.startDate, startOfDay), lte(events.startDate, endOfDay)));
    } else if (timeframe === 'this_week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      query = query.where(and(gte(events.startDate, startOfWeek), lte(events.startDate, endOfWeek)));
    } else if (timeframe === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      query = query.where(and(gte(events.startDate, startOfMonth), lte(events.startDate, endOfMonth)));
    }

    // Apply search query
    if (searchQuery) {
      query = query.where(
        or(
          ilike(events.title, `%${searchQuery}%`),
          ilike(events.description, `%${searchQuery}%`),
          ilike(events.location, `%${searchQuery}%`)
        )
      );
    }

    return await query
      .orderBy(desc(events.startDate))
      .limit(limit)
      .offset(offset);
  }

  async createComment(data: InsertComment): Promise<PostComment> {
    const [comment] = await db.insert(postComments).values(data).returning();
    return comment;
  }

  async getCommentsByPostId(postId: number): Promise<PostComment[]> {
    return await db
      .select()
      .from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(asc(postComments.createdAt));
  }

  // Enhanced post functionality methods would go here when implemented
}

export const storage = new DatabaseStorage();