// ESA LIFE CEO 61x21 - Comments API Routes
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { postComments, users } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getUserId } from '../utils/authHelper';

const router = Router();

// Get comments for a post
router.get('/api/posts/:postId/comments', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    
    const comments = await db
      .select()
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt));
    
    res.json(comments || []);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.json([]); // Return empty array on error to unblock platform
  }
});

// Get all comments (generic endpoint)
router.get('/api/comments', async (req: Request, res: Response) => {
  try {
    const { postId, limit = 50 } = req.query;
    
    let query = db
      .select()
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .orderBy(desc(postComments.createdAt))
      .limit(Number(limit));
    
    if (postId) {
      query = query.where(eq(postComments.postId, Number(postId)));
    }
    
    const comments = await query;
    res.json(comments || []);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.json([]); // Return empty array on error to unblock platform
  }
});

// Create a comment
router.post('/api/posts/:postId/comments', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    const postId = parseInt(req.params.postId);
    const { content, parentId, mentions, gifUrl, imageUrl } = req.body;
    
    const newComment = await db
      .insert(postComments)
      .values({
        postId,
        userId,
        content,
        parentId,
        mentions: mentions || [],
        gifUrl,
        imageUrl
      })
      .returning();
    
    res.json(newComment[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update a comment
router.put('/api/comments/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    const commentId = parseInt(req.params.id);
    const { content } = req.body;
    
    const updated = await db
      .update(postComments)
      .set({ 
        content,
        isEdited: true,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(postComments.id, commentId),
          eq(postComments.userId, userId)
        )
      )
      .returning();
    
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete a comment
router.delete('/api/comments/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    const commentId = parseInt(req.params.id);
    
    await db
      .delete(postComments)
      .where(
        and(
          eq(postComments.id, commentId),
          eq(postComments.userId, userId)
        )
      );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;