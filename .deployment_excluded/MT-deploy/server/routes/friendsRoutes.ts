import { Router, Request, Response } from 'express';
import { db } from '../db';
import { friends, users } from '../../shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { getUserId } from '../utils/authHelper';

const router = Router();

// Get user's friends
router.get('/api/friends', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    
    // Get all accepted friends
    const userFriends = await db
      .select()
      .from(friends)
      .leftJoin(users, eq(friends.friendId, users.id))
      .where(
        and(
          eq(friends.userId, userId),
          eq(friends.status, 'accepted')
        )
      );
    
    res.json(userFriends || []);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Get pending friend requests
router.get('/api/friends/requests', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    
    const requests = await db
      .select()
      .from(friends)
      .leftJoin(users, eq(friends.userId, users.id))
      .where(
        and(
          eq(friends.friendId, userId),
          eq(friends.status, 'pending')
        )
      );
    
    res.json(requests || []);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
});

// Send friend request
router.post('/api/friends/request', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    const { friendId } = req.body;
    
    const newRequest = await db
      .insert(friends)
      .values({
        userId: userId,
        friendId: parseInt(friendId),
        status: 'pending'
      })
      .returning();
    
    res.json(newRequest[0]);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept/reject friend request
router.put('/api/friends/request/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    
    const updated = await db
      .update(friends)
      .set({ status })
      .where(
        and(
          eq(friends.id, parseInt(id)),
          eq(friends.friendId, userId)
        )
      )
      .returning();
    
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating friend request:', error);
    res.status(500).json({ error: 'Failed to update friend request' });
  }
});

export default router;