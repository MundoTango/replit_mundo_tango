/**
 * ESA LIFE CEO 61x21 - Memories Feed Algorithm
 * Layer 26 (Recommendation Engine) + Layer 36 (Memory Systems) + Layer 24 (Social Features)
 * 
 * Sophisticated AI-powered memory curation system that surfaces the most meaningful
 * content based on temporal patterns, social connections, emotional resonance, and personal growth.
 */

import { db } from '../db';
import { posts, users, friends, friendshipActivities, reactions } from '../../shared/schema';
import { eq, and, sql, gte, lte, desc, asc, or, inArray } from 'drizzle-orm';
import { MentionCacheService } from './mentionCache';

interface MemoryScore {
  postId: number;
  totalScore: number;
  breakdown: {
    temporal: number;    // 0-30 points: "On this day", anniversaries
    social: number;      // 0-25 points: Friendship connections, mentions
    emotional: number;   // 0-25 points: Mood, sentiment, engagement
    content: number;     // 0-20 points: Media richness, topic relevance
  };
  reasons: string[];     // Human-readable explanations
}

export class MemoriesFeedAlgorithm {
  /**
   * Generate intelligent memories feed using ESA LIFE CEO 61x21 algorithm with filters
   */
  static async generateMemoriesFeed(
    userId: number,
    limit: number = 20,
    preferences: {
      temporalWeight?: number;    // Default: 1.0
      socialWeight?: number;      // Default: 1.0  
      emotionalWeight?: number;   // Default: 1.0
      contentWeight?: number;     // Default: 1.0
    } = {},
    filters: {
      filterType?: 'all' | 'following' | 'nearby';    // All Memories, Following, Nearby
      tags?: string[];                                 // Filter by tags
      visibility?: 'all' | 'public' | 'friends' | 'private'; // Post visibility
      location?: { lat: number; lng: number; radius: number }; // For nearby filter
    } = {}
  ): Promise<{
    memories: any[];
    algorithm: {
      processed: number;
      scored: number;
      topScores: MemoryScore[];
      filtersApplied: typeof filters;
    };
  }> {
    const startTime = Date.now();
    
    console.log(`🧠 ESA LIFE CEO 61x21 - Generating intelligent memories feed for user ${userId}`);
    
    // Set default weights
    const weights = {
      temporalWeight: preferences.temporalWeight || 1.0,
      socialWeight: preferences.socialWeight || 1.0,
      emotionalWeight: preferences.emotionalWeight || 1.0,
      contentWeight: preferences.contentWeight || 1.0
    };

    // Step 1: Get candidate posts with filters applied
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const candidatePosts = await this.getCandidatePosts(userId, twoYearsAgo, filters);
    console.log(`📊 Found ${candidatePosts.length} candidate posts for analysis`);
    
    // Step 2: Calculate memory scores for each post
    const scoredMemories: MemoryScore[] = [];
    
    for (const post of candidatePosts) {
      try {
        const score = await this.calculateMemoryScore(userId, post, weights);
        if (score.totalScore > 10) { // Minimum threshold for inclusion
          scoredMemories.push(score);
        }
      } catch (error) {
        console.error(`Error scoring post ${post.id}:`, error);
      }
    }

    // Step 3: Sort by score and apply diversity filters
    scoredMemories.sort((a, b) => b.totalScore - a.totalScore);
    const diversifiedMemories = await this.applyDiversityFilters(scoredMemories, limit);
    
    // Step 4: Fetch full post data for top memories
    const topMemoryIds = diversifiedMemories.slice(0, limit).map(m => m.postId);
    const memories = await this.getFullPostData(topMemoryIds);
    
    const processingTime = Date.now() - startTime;
    console.log(`🎯 Generated ${memories.length} memories in ${processingTime}ms`);
    
    return {
      memories,
      algorithm: {
        processed: candidatePosts.length,
        scored: scoredMemories.length,
        topScores: diversifiedMemories.slice(0, 10), // Top 10 for analysis
        filtersApplied: filters
      }
    };
  }

  /**
   * Get candidate posts for memory analysis with filters
   */
  private static async getCandidatePosts(
    userId: number, 
    sinceDate: Date,
    filters: {
      filterType?: 'all' | 'following' | 'nearby';
      tags?: string[];
      visibility?: 'all' | 'public' | 'friends' | 'private';
      location?: { lat: number; lng: number; radius: number };
    }
  ): Promise<any[]> {
    // Build base query conditions
    const baseConditions = [gte(posts.createdAt, sinceDate)];
    
    // Apply visibility filter
    if (filters.visibility && filters.visibility !== 'all') {
      baseConditions.push(eq(posts.visibility, filters.visibility));
    }

    // Apply tag filter
    if (filters.tags && filters.tags.length > 0) {
      // Filter posts that contain any of the specified hashtags
      const tagConditions = filters.tags.map(tag => 
        sql`${posts.hashtags} @> ARRAY[${tag}]::text[]`
      );
      baseConditions.push(or(...tagConditions));
    }

    // Get user's own posts based on filter type
    let userPosts: any[] = [];
    
    if (filters.filterType === 'all' || !filters.filterType) {
      // All Memories: User's own posts
      userPosts = await db
        .select({
          id: posts.id,
          userId: posts.userId,
          content: posts.content,
          mediaEmbeds: posts.mediaEmbeds,
          imageUrl: posts.imageUrl,
          videoUrl: posts.videoUrl,
          location: posts.location,
          hashtags: posts.hashtags,
          visibility: posts.visibility,
          createdAt: posts.createdAt,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          sharesCount: posts.sharesCount,
          authorUsername: users.username,
          authorFirstName: users.firstName,
          authorLastName: users.lastName,
          authorProfileImage: users.profileImage
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(
          and(
            eq(posts.userId, userId),
            ...baseConditions
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(500);
    }

    // Get friend posts based on filter type
    let friendInteractions: any[] = [];
    
    if (filters.filterType === 'following' || filters.filterType === 'all' || !filters.filterType) {
      // Following: Posts from friends
      friendInteractions = await db
        .select({
          id: posts.id,
          userId: posts.userId,
          content: posts.content,
          mediaEmbeds: posts.mediaEmbeds,
          imageUrl: posts.imageUrl,
          videoUrl: posts.videoUrl,
          location: posts.location,
          hashtags: posts.hashtags,
          visibility: posts.visibility,
          createdAt: posts.createdAt,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          sharesCount: posts.sharesCount,
          authorUsername: users.username,
          authorFirstName: users.firstName,
          authorLastName: users.lastName,
          authorProfileImage: users.profileImage
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .innerJoin(friends, or(
          and(eq(friends.userId, userId), eq(friends.friendId, posts.userId)),
          and(eq(friends.friendId, userId), eq(friends.userId, posts.userId))
        ))
        .where(
          and(
            eq(friends.status, 'accepted'),
            sql`${posts.userId} != ${userId}`, // Not user's own posts
            or(eq(posts.visibility, 'public'), eq(posts.visibility, 'friends')), // Visible to friends
            ...baseConditions
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(200);
    }

    // Get nearby posts based on location filter
    let nearbyPosts: any[] = [];
    
    if (filters.filterType === 'nearby' && filters.location) {
      // Nearby: Posts within radius of location
      const { lat, lng, radius } = filters.location;
      
      nearbyPosts = await db
        .select({
          id: posts.id,
          userId: posts.userId,
          content: posts.content,
          mediaEmbeds: posts.mediaEmbeds,
          imageUrl: posts.imageUrl,
          videoUrl: posts.videoUrl,
          location: posts.location,
          hashtags: posts.hashtags,
          visibility: posts.visibility,
          coordinates: posts.coordinates,
          createdAt: posts.createdAt,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          sharesCount: posts.sharesCount,
          authorUsername: users.username,
          authorFirstName: users.firstName,
          authorLastName: users.lastName,
          authorProfileImage: users.profileImage
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(
          and(
            eq(posts.visibility, 'public'), // Only public posts for nearby
            sql`posts.coordinates IS NOT NULL`, // Must have coordinates
            sql`ST_DWithin(
              ST_SetSRID(ST_Point(
                (posts.coordinates->>'lng')::float, 
                (posts.coordinates->>'lat')::float
              ), 4326),
              ST_SetSRID(ST_Point(${lng}, ${lat}), 4326),
              ${radius * 1000}
            )`, // Within radius (converted to meters)
            ...baseConditions
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(100);
    }

    // Combine and deduplicate based on filter type
    let allPosts: any[];
    
    if (filters.filterType === 'following') {
      allPosts = friendInteractions;
    } else if (filters.filterType === 'nearby') {
      allPosts = nearbyPosts;
    } else {
      // 'all' or undefined - combine all types
      allPosts = [...userPosts, ...friendInteractions, ...nearbyPosts];
    }
    
    const uniquePosts = Array.from(
      new Map(allPosts.map(post => [post.id, post])).values()
    );

    return uniquePosts;
  }

  /**
   * Calculate comprehensive memory score for a post
   */
  private static async calculateMemoryScore(
    userId: number, 
    post: any,
    weights: any
  ): Promise<MemoryScore> {
    const reasons: string[] = [];
    let temporalScore = 0;
    let socialScore = 0;
    let emotionalScore = 0;
    let contentScore = 0;

    // TEMPORAL SCORING (0-30 points)
    const temporal = await this.calculateTemporalScore(post, reasons);
    temporalScore = temporal * weights.temporalWeight;

    // SOCIAL SCORING (0-25 points)
    const social = await this.calculateSocialScore(userId, post, reasons);
    socialScore = social * weights.socialWeight;

    // EMOTIONAL SCORING (0-25 points)
    const emotional = await this.calculateEmotionalScore(userId, post, reasons);
    emotionalScore = emotional * weights.emotionalWeight;

    // CONTENT SCORING (0-20 points)
    const content = await this.calculateContentScore(post, reasons);
    contentScore = content * weights.contentWeight;

    const totalScore = temporalScore + socialScore + emotionalScore + contentScore;

    return {
      postId: post.id,
      totalScore,
      breakdown: {
        temporal: temporalScore,
        social: socialScore,
        emotional: emotionalScore,
        content: contentScore
      },
      reasons
    };
  }

  /**
   * Calculate temporal relevance score (Layer 36 - Memory Systems)
   */
  private static async calculateTemporalScore(post: any, reasons: string[]): Promise<number> {
    let score = 0;
    const now = new Date();
    const postDate = new Date(post.createdAt);
    const daysDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // "On This Day" memories (1-5 years ago, same date ±3 days)
    const thisDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const postDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
    const dayOfYearDiff = Math.abs(thisDay.getTime() - postDay.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayOfYearDiff <= 3 && daysDiff >= 365) {
      const yearsAgo = Math.floor(daysDiff / 365);
      if (yearsAgo === 1) {
        score += 30; // Perfect "On This Day" - 1 year
        reasons.push(`📅 One year ago today`);
      } else if (yearsAgo <= 5) {
        score += 25; // Good "On This Day" - 2-5 years
        reasons.push(`📅 ${yearsAgo} years ago today`);
      } else {
        score += 15; // Distant "On This Day" - 5+ years
        reasons.push(`📅 ${yearsAgo} years ago today`);
      }
    }

    // Seasonal memories (same month, different year)
    if (postDate.getMonth() === now.getMonth() && postDate.getFullYear() !== now.getFullYear()) {
      if (daysDiff >= 365) {
        score += 8;
        const monthName = postDate.toLocaleString('default', { month: 'long' });
        reasons.push(`🍂 ${monthName} memory`);
      }
    }

    // Weekly anniversaries (every 7 days)
    if (daysDiff > 0 && daysDiff % 7 === 0 && daysDiff <= 365) {
      score += 5;
      const weeksAgo = daysDiff / 7;
      reasons.push(`📆 ${weeksAgo} weeks ago`);
    }

    // Fresh content bonus (recent posts get slight temporal boost)
    if (daysDiff <= 7) {
      score += 3;
      reasons.push(`🆕 Recent memory`);
    }

    return Math.min(score, 30); // Cap at 30 points
  }

  /**
   * Calculate social relevance score (Layer 24 - Social Features + Friendship Algorithm)
   */
  private static async calculateSocialScore(userId: number, post: any, reasons: string[]): Promise<number> {
    let score = 0;

    // Check if post author is a friend and their closeness score
    if (post.userId !== userId) {
      const friendship = await db
        .select({
          closenessScore: friends.closenessScore,
          status: friends.status
        })
        .from(friends)
        .where(
          or(
            and(eq(friends.userId, userId), eq(friends.friendId, post.userId)),
            and(eq(friends.userId, post.userId), eq(friends.friendId, userId))
          )
        )
        .limit(1);

      if (friendship.length > 0 && friendship[0].status === 'accepted') {
        const closeness = friendship[0].closenessScore || 0;
        if (closeness >= 80) {
          score += 15;
          reasons.push(`💝 Close friend memory (${closeness}% closeness)`);
        } else if (closeness >= 60) {
          score += 10;
          reasons.push(`👥 Good friend memory (${closeness}% closeness)`);
        } else if (closeness >= 40) {
          score += 5;
          reasons.push(`🤝 Friend memory (${closeness}% closeness)`);
        }
      }
    }

    // Check for @mentions in the post content
    const mentionMatches = post.content?.match(/@(\w+)/g) || [];
    if (mentionMatches.length > 0) {
      score += Math.min(mentionMatches.length * 3, 10);
      reasons.push(`💬 Contains ${mentionMatches.length} mention${mentionMatches.length > 1 ? 's' : ''}`);
    }

    // High engagement from user's social network
    if (post.userId !== userId && post.likesCount > 10) {
      score += 5;
      reasons.push(`🔥 Popular in your network (${post.likesCount} likes)`);
    }

    // Comments indicate meaningful conversation
    if (post.commentsCount > 0) {
      score += Math.min(post.commentsCount * 2, 8);
      reasons.push(`💭 Generated conversation (${post.commentsCount} comments)`);
    }

    return Math.min(score, 25); // Cap at 25 points
  }

  /**
   * Calculate emotional resonance score (Layer 43 - Sentiment Analysis)
   */
  private static async calculateEmotionalScore(userId: number, post: any, reasons: string[]): Promise<number> {
    let score = 0;

    // Analyze content for positive sentiment indicators
    const content = post.content?.toLowerCase() || '';
    
    // Achievement/milestone words
    const achievementWords = ['graduated', 'promoted', 'married', 'birthday', 'anniversary', 
                             'celebration', 'success', 'proud', 'accomplished', 'milestone'];
    const achievements = achievementWords.filter(word => content.includes(word));
    if (achievements.length > 0) {
      score += 15;
      reasons.push(`🏆 Achievement memory (${achievements.join(', ')})`);
    }

    // Positive emotion words
    const positiveWords = ['happy', 'joy', 'love', 'amazing', 'wonderful', 'excited', 
                          'grateful', 'blessed', 'perfect', 'beautiful'];
    const positive = positiveWords.filter(word => content.includes(word));
    if (positive.length > 0) {
      score += Math.min(positive.length * 3, 12);
      reasons.push(`😊 Positive emotions (${positive.length} indicators)`);
    }

    // Travel/adventure indicators
    const travelWords = ['vacation', 'trip', 'travel', 'adventure', 'exploring', 'journey'];
    const travel = travelWords.filter(word => content.includes(word));
    if (travel.length > 0) {
      score += 8;
      reasons.push(`✈️ Travel memory`);
    }

    // Family/relationship indicators
    const relationshipWords = ['family', 'mom', 'dad', 'sister', 'brother', 'children', 
                              'husband', 'wife', 'partner', 'friend'];
    const relationships = relationshipWords.filter(word => content.includes(word));
    if (relationships.length > 0) {
      score += 6;
      reasons.push(`👨‍👩‍👧‍👦 Family/relationship memory`);
    }

    // High engagement indicates emotional resonance
    const totalEngagement = (post.likesCount || 0) + (post.commentsCount || 0) + (post.sharesCount || 0);
    if (totalEngagement > 15) {
      score += 10;
      reasons.push(`💖 High emotional impact (${totalEngagement} total interactions)`);
    } else if (totalEngagement > 5) {
      score += 5;
      reasons.push(`❤️ Meaningful to others (${totalEngagement} interactions)`);
    }

    return Math.min(score, 25); // Cap at 25 points
  }

  /**
   * Calculate content richness score (Layer 19 - Content Management)
   */
  private static async calculateContentScore(post: any, reasons: string[]): Promise<number> {
    let score = 0;

    // Media content bonus
    const hasMedia = (post.mediaEmbeds && Array.isArray(post.mediaEmbeds) && post.mediaEmbeds.length > 0) ||
                     post.imageUrl || post.videoUrl;
    
    if (hasMedia) {
      score += 8;
      reasons.push(`📸 Contains media`);
    }

    // Video content gets extra points (more engaging)
    const hasVideo = post.videoUrl || 
                    (post.mediaEmbeds && JSON.stringify(post.mediaEmbeds).includes('.mp4'));
    if (hasVideo) {
      score += 5;
      reasons.push(`🎥 Video content`);
    }

    // Location adds context
    if (post.location) {
      score += 4;
      reasons.push(`📍 Located at ${post.location}`);
    }

    // Longer, more detailed content
    const contentLength = post.content?.length || 0;
    if (contentLength > 200) {
      score += 3;
      reasons.push(`📝 Detailed post (${contentLength} characters)`);
    }

    return Math.min(score, 20); // Cap at 20 points
  }

  /**
   * Apply diversity filters to prevent similar memories dominating feed
   */
  private static async applyDiversityFilters(
    scoredMemories: MemoryScore[], 
    limit: number
  ): Promise<MemoryScore[]> {
    // Ensure temporal diversity - don't show too many memories from same day/week
    const diversified: MemoryScore[] = [];
    const usedDates = new Set<string>();
    const usedWeeks = new Set<string>();
    
    for (const memory of scoredMemories) {
      if (diversified.length >= limit) break;
      
      // Get post date for diversity checking
      const post = await db
        .select({ createdAt: posts.createdAt })
        .from(posts)
        .where(eq(posts.id, memory.postId))
        .limit(1);
      
      if (post.length > 0) {
        const date = new Date(post[0].createdAt);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const weekKey = `${date.getFullYear()}-${Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))}`;
        
        // Allow max 2 memories per day, 3 per week
        const dailyCount = Array.from(usedDates).filter(d => d === dateKey).length;
        const weeklyCount = Array.from(usedWeeks).filter(w => w === weekKey).length;
        
        if (dailyCount < 2 && weeklyCount < 3) {
          diversified.push(memory);
          usedDates.add(dateKey);
          usedWeeks.add(weekKey);
        }
      }
    }
    
    // Fill remaining slots with highest scoring memories if needed
    const remaining = scoredMemories.filter(m => 
      !diversified.find(d => d.postId === m.postId)
    ).slice(0, limit - diversified.length);
    
    return [...diversified, ...remaining];
  }

  /**
   * Get full post data for memory IDs
   */
  private static async getFullPostData(memoryIds: number[]): Promise<any[]> {
    if (memoryIds.length === 0) return [];
    
    return await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        mediaEmbeds: posts.mediaEmbeds,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        location: posts.location,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        sharesCount: posts.sharesCount,
        visibility: posts.visibility,
        authorId: users.id,
        authorUsername: users.username,
        authorEmail: users.email,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorProfileImage: users.profileImage
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(inArray(posts.id, memoryIds))
      .orderBy(desc(posts.createdAt));
  }

  /**
   * Get user's memory preferences for algorithm tuning
   */
  static async getUserMemoryPreferences(userId: number): Promise<any> {
    // This could be stored in user preferences table
    // For now, return defaults - can be enhanced later
    return {
      temporalWeight: 1.0,    // How much to emphasize "on this day" type memories  
      socialWeight: 1.0,      // How much to emphasize social connections
      emotionalWeight: 1.0,   // How much to emphasize emotional content
      contentWeight: 0.8,     // How much to emphasize media-rich content
      diversityLevel: 0.7,    // How much variety to ensure (0-1)
      minimumScore: 10        // Minimum score threshold for inclusion
    };
  }

  /**
   * Get algorithm performance stats for analytics
   */
  static async getAlgorithmStats(userId: number): Promise<any> {
    // This would track algorithm performance over time
    return {
      totalMemoriesGenerated: 0,
      averageScore: 0,
      userEngagement: 0,
      algorithmVersion: '61x21'
    };
  }
}