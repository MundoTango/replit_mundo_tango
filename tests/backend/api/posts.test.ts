import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { createAuthenticatedUser } from '../../factories/userFactory';
import { createTestPost } from '../../factories/postFactory';
import { createAuthHeaders, generateTestToken, mockAuthenticated } from '../../helpers/auth';

// Mock storage
jest.mock('../../../server/storage', () => ({
  storage: {
    createPost: jest.fn(),
    getPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    getUserPosts: jest.fn(),
    getPostsByHashtag: jest.fn(),
    getFeedPosts: jest.fn(),
    getUserByReplitId: jest.fn(),
    likePost: jest.fn(),
    unlikePost: jest.fn(),
    isPostLiked: jest.fn(),
    getPostComments: jest.fn(),
    createComment: jest.fn(),
    sharePost: jest.fn(),
  }
}));

import { storage } from '../../../server/storage';

describe('Posts API Tests', () => {
  let app: express.Application;
  let mockUser: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    app.use((req: any, res, next) => {
      req.session = { csrfToken: 'test-csrf-token' };
      req.isAuthenticated = jest.fn(() => false);
      next();
    });

    const { registerRoutes } = await import('../../../server/routes');
    await registerRoutes(app);

    mockUser = createAuthenticatedUser();
  });

  describe('POST /api/posts', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should create a new post', async () => {
      const postData = {
        content: 'This is a test post',
        hashtags: ['test', 'post'],
        location: 'Buenos Aires',
        visibility: 'public'
      };

      const createdPost = {
        id: 1,
        userId: mockUser.id,
        ...postData,
        createdAt: new Date(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.createPost as jest.Mock).mockResolvedValue(createdPost);

      const response = await request(app)
        .post('/api/posts')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(postData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        post: expect.objectContaining({
          content: postData.content,
          hashtags: postData.hashtags
        })
      });

      expect(storage.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          content: postData.content
        })
      );
    });

    it('should create a memory post with emotion tags', async () => {
      const memoryData = {
        content: 'Beautiful tango night',
        emotionTags: ['happy', 'nostalgic'],
        memoryDate: '2025-07-01',
        location: 'Salon Canning',
        postType: 'memory'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.createPost as jest.Mock).mockResolvedValue({
        id: 2,
        userId: mockUser.id,
        ...memoryData
      });

      const response = await request(app)
        .post('/api/posts')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(memoryData)
        .expect(201);

      expect(response.body.post).toMatchObject({
        postType: 'memory',
        emotionTags: memoryData.emotionTags
      });
    });

    it('should validate required fields', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/posts')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Content is required');
    });

    it('should handle media attachments', async () => {
      const postWithMedia = {
        content: 'Check out this photo!',
        mediaUrls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.createPost as jest.Mock).mockResolvedValue({
        id: 3,
        userId: mockUser.id,
        ...postWithMedia
      });

      const response = await request(app)
        .post('/api/posts')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(postWithMedia)
        .expect(201);

      expect(response.body.post.mediaUrls).toHaveLength(2);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should get a public post', async () => {
      const post = createTestPost(mockUser.id);
      const fullPost = {
        ...post,
        id: 1,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          username: mockUser.username,
          profileImage: mockUser.profileImage
        }
      };

      (storage.getPost as jest.Mock).mockResolvedValue(fullPost);

      const response = await request(app)
        .get('/api/posts/1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        post: expect.objectContaining({
          id: 1,
          content: post.content
        })
      });
    });

    it('should return 404 for non-existent post', async () => {
      (storage.getPost as jest.Mock).mockResolvedValue(null);

      await request(app)
        .get('/api/posts/999')
        .expect(404);
    });

    it('should restrict access to private posts', async () => {
      const privatePost = {
        id: 1,
        userId: 999, // Different user
        content: 'Private content',
        visibility: 'private'
      };

      (storage.getPost as jest.Mock).mockResolvedValue(privatePost);

      await request(app)
        .get('/api/posts/1')
        .expect(403);
    });
  });

  describe('PUT /api/posts/:id', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should update own post', async () => {
      const existingPost = {
        id: 1,
        userId: mockUser.id,
        content: 'Original content'
      };

      const updates = {
        content: 'Updated content',
        hashtags: ['updated']
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getPost as jest.Mock).mockResolvedValue(existingPost);
      (storage.updatePost as jest.Mock).mockResolvedValue({
        ...existingPost,
        ...updates,
        isEdited: true
      });

      const response = await request(app)
        .put('/api/posts/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(updates)
        .expect(200);

      expect(response.body.post).toMatchObject({
        content: updates.content,
        isEdited: true
      });
    });

    it('should not update others posts', async () => {
      const otherUserPost = {
        id: 1,
        userId: 999,
        content: 'Someone else post'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getPost as jest.Mock).mockResolvedValue(otherUserPost);

      await request(app)
        .put('/api/posts/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send({ content: 'Trying to update' })
        .expect(403);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should delete own post', async () => {
      const post = {
        id: 1,
        userId: mockUser.id,
        content: 'To be deleted'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getPost as jest.Mock).mockResolvedValue(post);
      (storage.deletePost as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/posts/1')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Post deleted successfully'
      });

      expect(storage.deletePost).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /api/posts/:id/like', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should like a post', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getPost as jest.Mock).mockResolvedValue({ id: 1, userId: 2 });
      (storage.isPostLiked as jest.Mock).mockResolvedValue(false);
      (storage.likePost as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/posts/1/like')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Post liked'
      });

      expect(storage.likePost).toHaveBeenCalledWith(1, mockUser.id);
    });

    it('should not like already liked post', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getPost as jest.Mock).mockResolvedValue({ id: 1 });
      (storage.isPostLiked as jest.Mock).mockResolvedValue(true);

      await request(app)
        .post('/api/posts/1/like')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(400);
    });
  });

  describe('DELETE /api/posts/:id/like', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should unlike a post', async () => {
      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getPost as jest.Mock).mockResolvedValue({ id: 1 });
      (storage.isPostLiked as jest.Mock).mockResolvedValue(true);
      (storage.unlikePost as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/posts/1/like')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Post unliked'
      });
    });
  });

  describe('GET /api/posts/:id/comments', () => {
    it('should get post comments', async () => {
      const comments = [
        {
          id: 1,
          postId: 1,
          userId: 2,
          content: 'Great post!',
          user: { name: 'Commenter', username: 'commenter1' }
        }
      ];

      (storage.getPost as jest.Mock).mockResolvedValue({ id: 1, visibility: 'public' });
      (storage.getPostComments as jest.Mock).mockResolvedValue(comments);

      const response = await request(app)
        .get('/api/posts/1/comments')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        comments: expect.arrayContaining([
          expect.objectContaining({
            content: 'Great post!'
          })
        ])
      });
    });
  });

  describe('POST /api/posts/:id/comment', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should add comment to post', async () => {
      const commentData = {
        content: 'Nice post!'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getPost as jest.Mock).mockResolvedValue({ 
        id: 1, 
        allowComments: true 
      });
      (storage.createComment as jest.Mock).mockResolvedValue({
        id: 1,
        postId: 1,
        userId: mockUser.id,
        content: commentData.content,
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/api/posts/1/comment')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(commentData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        comment: expect.objectContaining({
          content: commentData.content
        })
      });
    });
  });

  describe('GET /api/posts/feed', () => {
    it('should get user feed', async () => {
      const feedPosts = [
        createTestPost(1),
        createTestPost(2)
      ];

      (storage.getFeedPosts as jest.Mock).mockResolvedValue(feedPosts);

      const response = await request(app)
        .get('/api/posts/feed')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            content: expect.any(String)
          })
        ])
      });
    });

    it('should filter feed by hashtag', async () => {
      const hashtagPosts = [createTestPost(1, { hashtags: ['tango'] })];

      (storage.getPostsByHashtag as jest.Mock).mockResolvedValue(hashtagPosts);

      const response = await request(app)
        .get('/api/posts/feed')
        .query({ hashtag: 'tango' })
        .expect(200);

      expect(storage.getPostsByHashtag).toHaveBeenCalledWith('tango', expect.any(Object));
    });
  });

  describe('POST /api/posts/:id/share', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        mockAuthenticated(req, mockUser);
        next();
      });
    });

    it('should share a post', async () => {
      const shareData = {
        content: 'Check this out!'
      };

      (storage.getUserByReplitId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getPost as jest.Mock).mockResolvedValue({ 
        id: 1, 
        allowSharing: true 
      });
      (storage.sharePost as jest.Mock).mockResolvedValue({
        id: 2,
        userId: mockUser.id,
        sharedPostId: 1,
        content: shareData.content
      });

      const response = await request(app)
        .post('/api/posts/1/share')
        .set(createAuthHeaders(generateTestToken(mockUser)))
        .send(shareData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        post: expect.objectContaining({
          sharedPostId: 1
        })
      });
    });
  });
});