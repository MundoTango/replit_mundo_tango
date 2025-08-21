import { Router, Request, Response } from 'express';
import { SearchService } from '../services/searchService';
import { z } from 'zod';

const router = Router();

// Search query schema
const searchQuerySchema = z.object({
  q: z.string().min(2).max(100),
  type: z.array(z.enum(['user', 'post', 'event', 'group', 'memory'])).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  location: z.string().optional()
});

// Suggestions query schema
const suggestionsSchema = z.object({
  q: z.string().min(2).max(50),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(20)).optional()
});

/**
 * Universal search endpoint
 * GET /api/search/all?q=query&type[]=user&type[]=post&limit=20&offset=0
 */
router.get('/all', async (req: Request, res: Response) => {
  try {
    console.log('Search route /all called with query:', req.query);
    
    const validation = searchQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search parameters',
        details: validation.error.errors
      });
    }

    const { q, type, limit = 20, offset = 0, dateFrom, dateTo, location } = validation.data;
    const userId = req.user?.id;

    console.log('Calling SearchService.searchAll with:', { q, type, limit, offset, userId });
    
    const results = await SearchService.searchAll({
      query: q,
      filters: {
        type,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        location
      },
      limit,
      offset,
      userId
    });
    
    console.log('SearchService returned:', results);

    // Track search query is already handled in searchAll method

    res.json({
      success: true,
      results,
      query: q,
      filters: {
        type,
        dateFrom,
        dateTo,
        location
      },
      pagination: {
        limit,
        offset,
        hasMore: results.length === limit
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get search suggestions (autocomplete)
 * GET /api/search/suggestions?q=query&limit=10
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const validation = suggestionsSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: validation.error.errors
      });
    }

    const { q, limit = 10 } = validation.data;
    const suggestions = await SearchService.getSuggestions(q, limit);

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions'
    });
  }
});

/**
 * Get trending searches
 * GET /api/search/trending?limit=10&category=all
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const category = req.query.category as string || 'all';

    const trending = await SearchService.getTrending(limit, category);

    res.json({
      success: true,
      trending
    });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trending searches'
    });
  }
});

/**
 * Test search endpoints individually
 * GET /api/search/test/:type
 */
router.get('/test/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const query = 'tango';
    let results;

    switch (type) {
      case 'users':
        results = await SearchService['searchUsers'](query, 5);
        break;
      case 'posts':
        results = await SearchService['searchPosts'](query, 5);
        break;
      case 'events':
        results = await SearchService['searchEvents'](query, 5);
        break;
      case 'groups':
        results = await SearchService['searchGroups'](query, 5);
        break;
      case 'memories':
        results = await SearchService['searchMemories'](query, 5);
        break;
      default:
        return res.status(400).json({ error: 'Invalid search type' });
    }

    res.json({
      success: true,
      type,
      results
    });
  } catch (error) {
    console.error(`Test search error for ${type}:`, error);
    res.status(500).json({
      success: false,
      type,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

/**
 * Track search click (for analytics and relevance improvement)
 * POST /api/search/track
 */
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { query, resultId, resultType, position } = req.body;
    const userId = req.user?.id;

    // TODO: Implement click tracking for search relevance improvement
    console.log('Search click tracked:', { query, resultId, resultType, position, userId });

    res.json({
      success: true,
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track click'
    });
  }
});

/**
 * Test endpoint to check data
 * GET /api/search/test-data
 */
router.get('/test-data', async (req: Request, res: Response) => {
  try {
    const { db } = await import('../db');
    const { users, posts, events, groups } = await import('@shared/schema');
    
    // Get sample data
    const sampleUsers = await db.select().from(users).limit(3);
    const samplePosts = await db.select().from(posts).limit(3);
    const sampleEvents = await db.select().from(events).limit(3);
    const sampleGroups = await db.select().from(groups).limit(3);
    
    res.json({
      success: true,
      data: {
        users: sampleUsers,
        posts: samplePosts,
        events: sampleEvents,
        groups: sampleGroups
      }
    });
  } catch (error) {
    console.error('Test data error:', error);
    res.status(500).json({ success: false, error: 'Failed to get test data' });
  }
});

export default router;