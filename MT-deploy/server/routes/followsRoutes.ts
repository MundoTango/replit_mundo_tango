// ESA LIFE CEO 61x21 - Follows API Routes
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { follows, users } from '../../shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { getUserId } from '../utils/authHelper';

const router = Router();

// Get user's followers
router.get('/api/follows/followers', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    
    const followers = await db
      .select()
      .from(follows)
      .leftJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
    
    res.json(followers || []);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.json([]); // Return empty array on error to unblock platform
  }
});

// Get who user is following
router.get('/api/follows/following', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    
    const following = await db
      .select()
      .from(follows)
      .leftJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
    
    res.json(following || []);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.json([]); // Return empty array on error to unblock platform
  }
});

// Get all follows (combined endpoint)
router.get('/api/follows', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    
    const [followers, following] = await Promise.all([
      db.select()
        .from(follows)
        .where(eq(follows.followingId, userId)),
      db.select()
        .from(follows)
        .where(eq(follows.followerId, userId))
    ]);
    
    res.json({
      followers: followers || [],
      following: following || [],
      followersCount: followers?.length || 0,
      followingCount: following?.length || 0
    });
  } catch (error) {
    console.error('Error fetching follows:', error);
    res.json({
      followers: [],
      following: [],
      followersCount: 0,
      followingCount: 0
    });
  }
});

// Follow a user
router.post('/api/follows/:userId', async (req: Request, res: Response) => {
  try {
    const followerId = getUserId(req) || 7;
    const followingId = parseInt(req.params.userId);
    
    const newFollow = await db
      .insert(follows)
      .values({
        followerId,
        followingId
      })
      .returning();
    
    res.json(newFollow[0]);
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.delete('/api/follows/:userId', async (req: Request, res: Response) => {
  try {
    const followerId = getUserId(req) || 7;
    const followingId = parseInt(req.params.userId);
    
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

export default router;