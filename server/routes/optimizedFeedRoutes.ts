import { Router, Request, Response } from 'express';
import { db } from '../db';
import { posts, users, post_likes, post_comments, memories, groups, group_members } from '@shared/schema';
import { eq, desc, and, or, inArray, sql, gt, lt } from 'drizzle-orm';
import { getCache, cacheKeys } from '../services/cacheService';
import { setUserContext } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

// Constants for optimization
const FEED_PAGE_SIZE = 20;
const FEED_CACHE_TTL = 60; // 1 minute
const MAX_FEED_PAGES_CACHED = 5;

// Generate cache key for feed query
function generateFeedCacheKey(userId: number, page: number, filters: any): string {
  const filterString = JSON.stringify(filters, Object.keys(filters).sort());
  const hash = crypto.createHash('md5').update(filterString).digest('hex');
  return `feed:${userId}:${page}:${hash}`;
}

// Optimized feed endpoint with cursor-based pagination and caching
router.get('/api/optimized/feed', setUserContext, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const tenantId = (req as any).tenant?.id;
    
    // Parse query parameters
    const cursor = req.query.cursor as string;
    const limit = Math.min(parseInt(req.query.limit as string) || FEED_PAGE_SIZE, 50);
    const feedType = req.query.type as string || 'all'; // all, following, groups, tenant
    
    const cache = getCache();
    
    // Generate cache key if using page-based pagination
    const page = parseInt(req.query.page as string) || 1;
    const cacheKey = generateFeedCacheKey(userId || 0, page, { feedType, tenantId });
    
    // Check cache first (only for initial pages without cursor)
    if (!cursor && page <= MAX_FEED_PAGES_CACHED) {
      const cachedFeed = await cache.get(cacheKey);
      if (cachedFeed) {
        return res.json({
          success: true,
          data: cachedFeed,
          cached: true
        });
      }
    }
    
    // Build optimized query
    let feedQuery = db
      .select({
        // Select only needed columns for initial feed display
        id: posts.id,
        content: posts.content,
        media_urls: posts.media_urls,
        visibility: posts.visibility,
        created_at: posts.created_at,
        updated_at: posts.updated_at,
        // User info
        user_id: posts.user_id,
        username: users.username,
        user_name: users.name,
        user_avatar: users.profile_image,
        // Aggregated counts using subqueries
        likes_count: sql<number>`(
          SELECT COUNT(*) FROM ${post_likes} 
          WHERE ${post_likes.post_id} = ${posts.id}
        )`,
        comments_count: sql<number>`(
          SELECT COUNT(*) FROM ${post_comments} 
          WHERE ${post_comments.post_id} = ${posts.id}
        )`,
        // Check if current user liked
        user_liked: userId ? sql<boolean>`(
          SELECT EXISTS(
            SELECT 1 FROM ${post_likes} 
            WHERE ${post_likes.post_id} = ${posts.id} 
            AND ${post_likes.user_id} = ${userId}
          )
        )` : sql<boolean>`false`,
      })
      .from(posts)
      .innerJoin(users, eq(posts.user_id, users.id))
      .where(
        and(
          // Cursor-based pagination
          cursor ? lt(posts.created_at, new Date(cursor)) : undefined,
          // Feed type filters
          feedType === 'following' && userId ? 
            sql`${posts.user_id} IN (
              SELECT following_id FROM follows 
              WHERE follower_id = ${userId}
            )` : undefined,
          feedType === 'groups' && userId ?
            sql`${posts.user_id} IN (
              SELECT DISTINCT p2.user_id FROM posts p2
              INNER JOIN group_members gm ON gm.user_id = ${userId}
              WHERE p2.group_id = gm.group_id
            )` : undefined,
          feedType === 'tenant' && tenantId ?
            eq(posts.tenant_id, tenantId) : undefined,
          // Visibility filter
          or(
            eq(posts.visibility, 'public'),
            userId ? eq(posts.user_id, userId) : undefined
          )
        )
      )
      .orderBy(desc(posts.created_at))
      .limit(limit);
    
    // Execute query
    const feedPosts = await feedQuery;
    
    // Transform results for response
    const transformedPosts = feedPosts.map(post => ({
      ...post,
      type: 'post',
      media_urls: post.media_urls || [],
      created_at: post.created_at.toISOString(),
      updated_at: post.updated_at?.toISOString(),
    }));
    
    // Include memories in feed if requested
    if (req.query.includeMemories === 'true') {
      const memoriesQuery = db
        .select({
          id: memories.id,
          content: memories.content,
          emotion_tags: memories.emotion_tags,
          location: memories.location,
          created_at: memories.created_at,
          user_id: memories.user_id,
          username: users.username,
          user_name: users.name,
          user_avatar: users.profile_image,
        })
        .from(memories)
        .innerJoin(users, eq(memories.user_id, users.id))
        .where(
          and(
            cursor ? lt(memories.created_at, new Date(cursor)) : undefined,
            or(
              eq(memories.emotion_visibility, 'public'),
              userId ? eq(memories.user_id, userId) : undefined
            )
          )
        )
        .orderBy(desc(memories.created_at))
        .limit(Math.floor(limit / 2)); // Split limit between posts and memories
      
      const memoryItems = await memoriesQuery;
      
      // Merge and sort posts and memories
      const allItems = [
        ...transformedPosts,
        ...memoryItems.map(memory => ({
          ...memory,
          type: 'memory',
          created_at: memory.created_at.toISOString(),
        }))
      ].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, limit);
      
      transformedPosts.length = 0;
      transformedPosts.push(...allItems);
    }
    
    // Prepare response
    const response = {
      success: true,
      data: transformedPosts,
      nextCursor: transformedPosts.length === limit ? 
        transformedPosts[transformedPosts.length - 1].created_at : null,
      hasMore: transformedPosts.length === limit
    };
    
    // Cache the results for initial pages
    if (!cursor && page <= MAX_FEED_PAGES_CACHED) {
      await cache.set(cacheKey, response, FEED_CACHE_TTL);
    }
    
    res.json(response);
  } catch (error) {
    console.error('Optimized feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load feed'
    });
  }
});

// Optimized search endpoint with full-text search
router.get('/api/optimized/search', setUserContext, async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const type = req.query.type as string || 'all'; // all, users, posts, events, groups
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = parseInt(req.query.offset as string) || 0;
    
    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: {
          users: [],
          posts: [],
          events: [],
          groups: []
        }
      });
    }
    
    const cache = getCache();
    const cacheKey = `search:${type}:${query}:${limit}:${offset}`;
    
    // Check cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }
    
    const results: any = {};
    const searchPattern = `%${query}%`;
    
    // Parallel search queries
    const promises = [];
    
    // Search users
    if (type === 'all' || type === 'users') {
      promises.push(
        db
          .select({
            id: users.id,
            username: users.username,
            name: users.name,
            profile_image: users.profile_image,
            city: users.city,
            country: users.country,
          })
          .from(users)
          .where(
            or(
              sql`LOWER(${users.username}) LIKE LOWER(${searchPattern})`,
              sql`LOWER(${users.name}) LIKE LOWER(${searchPattern})`
            )
          )
          .limit(limit)
          .offset(offset)
          .then(data => { results.users = data; })
      );
    }
    
    // Search posts
    if (type === 'all' || type === 'posts') {
      promises.push(
        db
          .select({
            id: posts.id,
            content: posts.content,
            created_at: posts.created_at,
            user_id: posts.user_id,
            username: users.username,
            user_name: users.name,
          })
          .from(posts)
          .innerJoin(users, eq(posts.user_id, users.id))
          .where(
            and(
              sql`LOWER(${posts.content}) LIKE LOWER(${searchPattern})`,
              eq(posts.visibility, 'public')
            )
          )
          .orderBy(desc(posts.created_at))
          .limit(limit)
          .offset(offset)
          .then(data => { results.posts = data; })
      );
    }
    
    // Execute all searches in parallel
    await Promise.all(promises);
    
    // Cache results
    await cache.set(cacheKey, results, 300); // 5 minutes
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

// Optimized trending content endpoint
router.get('/api/optimized/trending', async (req: Request, res: Response) => {
  try {
    const cache = getCache();
    const cacheKey = 'trending:content';
    
    // Check cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }
    
    // Get trending posts from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const trendingPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        media_urls: posts.media_urls,
        created_at: posts.created_at,
        user_id: posts.user_id,
        username: users.username,
        user_name: users.name,
        user_avatar: users.profile_image,
        engagement_score: sql<number>`
          (SELECT COUNT(*) FROM ${post_likes} WHERE ${post_likes.post_id} = ${posts.id}) * 2 +
          (SELECT COUNT(*) FROM ${post_comments} WHERE ${post_comments.post_id} = ${posts.id}) * 3
        `,
      })
      .from(posts)
      .innerJoin(users, eq(posts.user_id, users.id))
      .where(
        and(
          gt(posts.created_at, twentyFourHoursAgo),
          eq(posts.visibility, 'public')
        )
      )
      .orderBy(sql`engagement_score DESC`)
      .limit(10);
    
    // Cache for 15 minutes
    await cache.set(cacheKey, trendingPosts, 900);
    
    res.json({
      success: true,
      data: trendingPosts
    });
  } catch (error) {
    console.error('Trending content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load trending content'
    });
  }
});

export default router;