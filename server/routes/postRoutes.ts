// ESA LIFE CEO 56x21 - Optimized Post Routes to reduce memory pressure
import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { getUserId } from '../utils/authHelper';
import { db } from '../db';
import { posts } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// ESA LIFE CEO 56x21 - Delete post endpoint (missing functionality)
router.delete('/api/posts/:id', isAuthenticated, async (req: any, res) => {
  // DELETE /api/posts/:id initiated
  
  try {
    const postId = parseInt(req.params.id);
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }
    
    // Get user
    let user = await storage.getUser(userId);
    if (!user && typeof userId === 'string') {
      user = await storage.getUserByReplitId(userId);
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Check if post exists and user owns it
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }
    
    // Check ownership or admin status
    const isOwner = post.userId === user.id;
    const isAdmin = user.username === 'admin' || user.email?.includes('admin');
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to delete this post' 
      });
    }
    
    // Delete the post
    await db.delete(posts).where(eq(posts.id, postId));
    
    // Post deleted successfully
    
    return res.json({ 
      success: true,
      message: 'Post deleted successfully' 
    });
    
  } catch (error: any) {
    console.error('Delete post error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to delete post',
      error: error.message 
    });
  }
});

// ESA LIFE CEO 56x21 - Memory-optimized update post endpoint
router.patch('/api/posts/:id', isAuthenticated, async (req: any, res) => {
  // PATCH /api/posts/:id initiated
  
  try {
    const postId = parseInt(req.params.id);
    const userId = getUserId(req);
    const { content } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }
    
    // Get user
    let user = await storage.getUser(userId);
    if (!user && typeof userId === 'string') {
      user = await storage.getUserByReplitId(userId);
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Check if post exists and user owns it
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }
    
    if (post.userId !== user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only edit your own posts' 
      });
    }
    
    // Update the post
    const [updatedPost] = await db
      .update(posts)
      .set({ 
        content,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId))
      .returning();
    
    // Post updated successfully
    
    return res.json({ 
      success: true,
      message: 'Post updated successfully',
      data: updatedPost 
    });
    
  } catch (error: any) {
    console.error('Update post error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update post',
      error: error.message 
    });
  }
});

export default router;