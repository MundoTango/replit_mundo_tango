/**
 * ESA LIFE CEO 56x21 - Fixed Posts Routes
 * Ensures media is properly returned with posts
 */

import { Router } from 'express';
import { storage } from '../storage';
import { getUserId } from '../utils/authHelper';

const router = Router();

/**
 * Get all posts - main endpoint
 */
router.get('/api/posts', async (req: any, res) => {
  try {
    const userId = await getUserId(req) || 7;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const posts = await storage.getFeedPosts(userId, limit, offset);
    
    res.json({
      success: true,
      posts: posts || []
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.json({
      success: false,
      posts: []
    });
  }
});

/**
 * Get posts feed with media support
 */
router.get('/api/posts/feed', async (req: any, res) => {
  try {
    // Posts feed requested
    
    // Get user from session or use test user
    const userId = await getUserId(req) || 7; // Default to Scott's user ID for testing
    
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // ESA LIFE CEO 56x21 - Get posts from database using correct method
    const posts = await storage.getFeedPosts(userId, limit, offset);
    
    // ESA LIFE CEO 56x21 - Ensure media URLs are properly formatted
    const postsWithMedia = posts.map(post => {
      const formattedPost: any = {
        ...post,
        id: post.id || post.memoryId,
        content: post.content || '',
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        sharesCount: post.sharesCount || 0,
        createdAt: post.createdAt,
        user: post.user || {
          id: post.userId,
          name: post.userName || 'Unknown',
          username: post.userUsername || 'unknown',
          profileImage: post.userProfileImage
        }
      };

      // ESA LIFE CEO 56x21 - Ensure media URLs are properly formatted
      // First check mediaEmbeds (where we store all media URLs)
      if (post.mediaEmbeds && Array.isArray(post.mediaEmbeds) && post.mediaEmbeds.length > 0) {
        // Use mediaEmbeds as the source for all media URLs
        formattedPost.mediaUrls = post.mediaEmbeds.map((url: string) => 
          url.startsWith('/') ? url : `/${url}`
        );
        // Set imageUrl/videoUrl from mediaUrls for backward compatibility
        if (!formattedPost.imageUrl && formattedPost.mediaUrls.length > 0) {
          formattedPost.imageUrl = formattedPost.mediaUrls[0];
        }
        // Find and set video URL if exists
        const videoUrl = formattedPost.mediaUrls.find((url: string) =>
          url.toLowerCase().endsWith('.mp4') || 
          url.toLowerCase().endsWith('.mov') ||
          url.toLowerCase().endsWith('.webm') ||
          url.toLowerCase().endsWith('.avi')
        );
        if (videoUrl) {
          formattedPost.videoUrl = videoUrl;
        }
      } else if (post.imageUrl) {
        // Fallback to constructing from imageUrl/videoUrl
        const imageUrl = post.imageUrl.startsWith('/') ? post.imageUrl : `/${post.imageUrl}`;
        formattedPost.imageUrl = imageUrl;
        
        // Add to mediaUrls array for multiple media support
        formattedPost.mediaUrls = [imageUrl];
        
        // Also check for additional media
        if (post.videoUrl) {
          const videoUrl = post.videoUrl.startsWith('/') ? post.videoUrl : `/${post.videoUrl}`;
          formattedPost.mediaUrls.push(videoUrl);
          formattedPost.videoUrl = videoUrl;
        }
      } else if (post.media && Array.isArray(post.media)) {
        // Handle posts with media array
        formattedPost.mediaUrls = post.media.map((url: string) => 
          url.startsWith('/') ? url : `/${url}`
        );
        formattedPost.imageUrl = formattedPost.mediaUrls[0]; // Use first as primary
      }
      
      // ESA LIFE CEO 56x21 - Ensure mediaUrls is always an array
      if (!formattedPost.mediaUrls) {
        formattedPost.mediaUrls = [];
      }

      return formattedPost;
    });
    
    // Returning posts with media
    if (postsWithMedia.length > 0) {
      // Debug - First post media info logged
    }
    
    res.json({ 
      success: true, 
      data: postsWithMedia 
    });
    
  } catch (error: any) {
    console.error('❌ Posts feed error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch posts',
      error: error.message 
    });
  }
});

/**
 * Get single post with media
 */
router.get('/api/posts/:id', async (req: any, res) => {
  try {
    const postId = req.params.id;
    const post = await storage.getPostById(postId);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    // Format post with media
    const formattedPost = {
      ...post,
      mediaUrls: post.imageUrl ? [post.imageUrl] : []
    };
    
    res.json({ 
      success: true, 
      data: formattedPost 
    });
    
  } catch (error: any) {
    console.error('❌ Get post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get post',
      error: error.message 
    });
  }
});

/**
 * Create new post
 */
router.post('/api/posts', async (req: any, res) => {
  try {
    const userId = await getUserId(req) || 7;
    
    const postData = {
      ...req.body,
      userId,
      createdAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    };
    
    const newPost = await storage.createPost(postData);
    
    res.json({
      success: true,
      data: newPost
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
});

/**
 * Update post
 */
router.put('/api/posts/:id', async (req: any, res) => {
  try {
    const postId = req.params.id;
    const userId = await getUserId(req) || 7;
    
    // Verify ownership
    const post = await storage.getPostById(postId);
    if (!post || post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to edit this post'
      });
    }
    
    const updatedPost = await storage.updatePost(postId, req.body);
    
    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error: any) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
});

/**
 * Delete post
 */
router.delete('/api/posts/:id', async (req: any, res) => {
  try {
    const postId = req.params.id;
    const userId = await getUserId(req) || 7;
    
    // Verify ownership
    const post = await storage.getPostById(postId);
    if (!post || post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this post'
      });
    }
    
    await storage.deletePost(postId);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

export default router;