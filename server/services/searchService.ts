import { db } from '../db';
import { users, posts, events, groups } from '@shared/schema';
import { eq, or, like, and, sql, desc, asc } from 'drizzle-orm';

export interface SearchResult {
  id: string | number;
  type: 'user' | 'post' | 'event' | 'group' | 'memory';
  title: string;
  description?: string;
  imageUrl?: string;
  metadata?: any;
  score?: number;
  createdAt?: Date;
}

export interface SearchFilters {
  type?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
  visibility?: string;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
  userId?: number;
}

export class SearchService {
  /**
   * Universal search across all content types
   */
  static async searchAll(options: SearchOptions): Promise<{ results: SearchResult[], total: number }> {
    const { query, filters, limit = 20, offset = 0, userId } = options;
    const results: SearchResult[] = [];
    
    if (!query || query.trim().length < 2) {
      return { results: [], total: 0 };
    }

    const searchQuery = `%${query.toLowerCase()}%`;
    
    // Track search query for trending
    await this.trackSearch(query, userId);

    // Search users
    if (!filters?.type || filters.type.includes('user')) {
      const userResults = await this.searchUsers(searchQuery, limit);
      results.push(...userResults);
    }

    // Search posts
    if (!filters?.type || filters.type.includes('post')) {
      const postResults = await this.searchPosts(searchQuery, limit);
      results.push(...postResults);
    }

    // Search events
    if (!filters?.type || filters.type.includes('event')) {
      const eventResults = await this.searchEvents(searchQuery, limit, filters);
      results.push(...eventResults);
    }

    // Search groups
    if (!filters?.type || filters.type.includes('group')) {
      const groupResults = await this.searchGroups(searchQuery, limit);
      results.push(...groupResults);
    }

    // Search memories
    if (!filters?.type || filters.type.includes('memory')) {
      const memoryResults = await this.searchMemories(searchQuery, limit, userId);
      results.push(...memoryResults);
    }

    // Sort by relevance/score and apply pagination
    const sortedResults = results
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(offset, offset + limit);

    return {
      results: sortedResults,
      total: results.length
    };
  }

  /**
   * Search users
   */
  private static async searchUsers(query: string, limit: number): Promise<SearchResult[]> {
    const userResults = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        bio: users.bio,
        profileImage: users.profileImage,
        createdAt: users.createdAt
      })
      .from(users)
      .where(
        or(
          like(users.name, query),
          like(users.username, query),
          like(users.bio, query)
        )
      )
      .limit(limit);

    return userResults.map(user => ({
      id: user.id,
      type: 'user' as const,
      title: user.name || user.username || 'User',
      description: user.bio || undefined,
      imageUrl: user.profileImage || undefined,
      metadata: { username: user.username },
      score: this.calculateScore(query, `${user.name} ${user.username} ${user.bio}`),
      createdAt: user.createdAt
    }));
  }

  /**
   * Search posts
   */
  private static async searchPosts(query: string, limit: number): Promise<SearchResult[]> {
    const postResults = await db
      .select({
        id: posts.id,
        content: posts.content,
        userId: posts.userId,
        createdAt: posts.createdAt,
        userName: users.name,
        userUsername: users.username,
        userProfileImage: users.profileImage
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(
        sql`LOWER(${posts.content}) LIKE ${query}`
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    return postResults.map(post => ({
      id: post.id,
      type: 'post' as const,
      title: post.content?.substring(0, 100) + (post.content && post.content.length > 100 ? '...' : '') || 'Post',
      description: `By ${post.userName || post.userUsername || 'Unknown'}`,
      imageUrl: post.userProfileImage || undefined,
      metadata: { 
        userId: post.userId,
        authorName: post.userName,
        authorUsername: post.userUsername
      },
      score: this.calculateScore(query, post.content || ''),
      createdAt: post.createdAt
    }));
  }

  /**
   * Search events
   */
  private static async searchEvents(query: string, limit: number, filters?: SearchFilters): Promise<SearchResult[]> {
    let whereConditions = [
      or(
        sql`LOWER(${events.title}) LIKE ${query}`,
        sql`LOWER(${events.description}) LIKE ${query}`,
        sql`LOWER(${events.location}) LIKE ${query}`
      )
    ];

    // Apply date filters
    if (filters?.dateFrom) {
      whereConditions.push(sql`${events.startDate} >= ${filters.dateFrom}`);
    }
    if (filters?.dateTo) {
      whereConditions.push(sql`${events.startDate} <= ${filters.dateTo}`);
    }
    if (filters?.location) {
      whereConditions.push(like(sql`LOWER(${events.location})`, `%${filters.location.toLowerCase()}%`));
    }

    const eventResults = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        startDate: events.startDate,
        coverImage: events.coverImage,
        createdAt: events.createdAt
      })
      .from(events)
      .where(and(...whereConditions))
      .orderBy(asc(events.startDate))
      .limit(limit);

    return eventResults.map(event => ({
      id: event.id,
      type: 'event' as const,
      title: event.title,
      description: `${event.location} • ${new Date(event.startDate).toLocaleDateString()}`,
      imageUrl: event.coverImage || undefined,
      metadata: { 
        location: event.location,
        startDate: event.startDate
      },
      score: this.calculateScore(query, `${event.title} ${event.description} ${event.location}`),
      createdAt: event.createdAt
    }));
  }

  /**
   * Search groups
   */
  private static async searchGroups(query: string, limit: number): Promise<SearchResult[]> {
    const groupResults = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        coverImage: groups.coverImage,
        type: groups.type,
        memberCount: sql<number>`(SELECT COUNT(*) FROM group_members WHERE group_id = ${groups.id})`.as('memberCount'),
        createdAt: groups.createdAt
      })
      .from(groups)
      .where(
        or(
          sql`LOWER(${groups.name}) LIKE ${query}`,
          sql`LOWER(${groups.description}) LIKE ${query}`
        )
      )
      .limit(limit);

    return groupResults.map(group => ({
      id: group.id,
      type: 'group' as const,
      title: group.name,
      description: `${group.type} • ${group.memberCount} members`,
      imageUrl: group.coverImage || undefined,
      metadata: { 
        groupType: group.type,
        memberCount: group.memberCount
      },
      score: this.calculateScore(query, `${group.name} ${group.description}`),
      createdAt: group.createdAt
    }));
  }

  /**
   * Search memories (posts)
   */
  private static async searchMemories(query: string, limit: number, userId?: number): Promise<SearchResult[]> {
    // Note: Memories are stored as posts in the database
    const memoryResults = await db
      .select({
        id: posts.id,
        content: posts.content,
        hashtags: posts.hashtags,
        userId: posts.userId,
        isPublic: posts.isPublic,
        visibility: posts.visibility,
        createdAt: posts.createdAt,
        userName: users.name,
        userUsername: users.username,
        userProfileImage: users.profileImage
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(
        and(
          or(
            sql`LOWER(${posts.content}) LIKE ${query}`,
            sql`LOWER(${posts.plainText}) LIKE ${query}`
          ),
          or(
            eq(posts.isPublic, true),
            eq(posts.visibility, 'public'),
            userId ? eq(posts.userId, userId) : sql`false`
          )
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    return memoryResults.map(memory => ({
      id: memory.id,
      type: 'memory' as const,
      title: memory.content?.substring(0, 100) + (memory.content && memory.content.length > 100 ? '...' : '') || 'Memory',
      description: `By ${memory.userName || memory.userUsername || 'Unknown'}`,
      imageUrl: memory.userProfileImage || undefined,
      metadata: { 
        userId: memory.userId,
        hashtags: memory.hashtags,
        visibility: memory.visibility,
        isPublic: memory.isPublic
      },
      score: this.calculateScore(query, memory.content || ''),
      createdAt: memory.createdAt
    }));
  }

  /**
   * Get search suggestions for autocomplete
   */
  static async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const searchQuery = `${query.toLowerCase()}%`;
    
    // Get trending searches that match
    const trendingMatches = await db.execute(sql`
      SELECT query FROM trending_searches 
      WHERE LOWER(query) LIKE ${searchQuery}
      ORDER BY search_count DESC
      LIMIT ${limit}
    `);

    // Get user names that match
    const userMatches = await db
      .select({ name: users.name })
      .from(users)
      .where(like(sql`LOWER(${users.name})`, searchQuery))
      .limit(5);

    // Get group names that match
    const groupMatches = await db
      .select({ name: groups.name })
      .from(groups)
      .where(like(sql`LOWER(${groups.name})`, searchQuery))
      .limit(5);

    const suggestions = new Set<string>();
    
    trendingMatches.rows.forEach((row: any) => suggestions.add(row.query));
    userMatches.forEach(user => user.name && suggestions.add(user.name));
    groupMatches.forEach(group => suggestions.add(group.name));

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get trending searches
   */
  static async getTrending(limit: number = 10, category?: string): Promise<Array<{ query: string, count: number }>> {
    const query = category 
      ? sql`SELECT query, search_count as count FROM trending_searches WHERE category = ${category} AND last_searched_at > NOW() - INTERVAL '7 days' ORDER BY search_count DESC LIMIT ${limit}`
      : sql`SELECT query, search_count as count FROM trending_searches WHERE last_searched_at > NOW() - INTERVAL '7 days' ORDER BY search_count DESC LIMIT ${limit}`;
    
    const results = await db.execute(query);
    return results.rows as Array<{ query: string, count: number }>;
  }

  /**
   * Track search query for analytics
   */
  private static async trackSearch(query: string, userId?: number): Promise<void> {
    try {
      // Use the increment_search_count function if it exists, otherwise just insert
      await db.execute(sql`
        SELECT increment_search_count(${query.toLowerCase()}, 'all')
      `).catch(async () => {
        // If function doesn't exist, fall back to direct insert
        await db.execute(sql`
          INSERT INTO trending_searches (query, category, search_count, last_searched_at, updated_at)
          VALUES (${query.toLowerCase()}, 'all', 1, NOW(), NOW())
        `).catch(() => {
          // Ignore duplicate errors
        });
      });

      // Track user search history if userId provided
      if (userId) {
        await db.execute(sql`
          INSERT INTO search_history (user_id, query, created_at)
          VALUES (${userId}, ${query}, NOW())
        `);
      }
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  /**
   * Calculate relevance score
   */
  private static calculateScore(query: string, text: string): number {
    if (!text) return 0;
    
    const lowerQuery = query.toLowerCase();
    const lowerText = text.toLowerCase();
    
    // Exact match
    if (lowerText === lowerQuery) return 100;
    
    // Starts with query
    if (lowerText.startsWith(lowerQuery)) return 80;
    
    // Contains query as whole word
    const wordBoundary = new RegExp(`\\b${lowerQuery}\\b`, 'i');
    if (wordBoundary.test(text)) return 60;
    
    // Contains query
    if (lowerText.includes(lowerQuery)) return 40;
    
    // Partial match
    return 20;
  }
}