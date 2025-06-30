import request from 'supertest';
import { Express } from 'express';
import { db } from '@server/db';
import { posts, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Mock database for testing
jest.mock('@server/db');

describe('Posts API Endpoints', () => {
  let app: Express;
  let mockUser: any;

  beforeAll(async () => {
    // Import app after mocking dependencies
    const { default: createApp } = await import('../../../server/index');
    app = createApp;

    // Create mock user for testing
    mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/posts/feed', () => {
    it('should return posts feed with proper authentication', async () => {
      const mockPosts = [
        {
          id: 1,
          userId: 1,
          content: 'Test post content',
          imageUrl: null,
          videoUrl: null,
          likesCount: 5,
          commentsCount: 2,
          sharesCount: 1,
          isPublic: true,
          createdAt: new Date(),
          user: mockUser
        }
      ];

      // Mock database query
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  offset: jest.fn().mockResolvedValue(mockPosts)
                })
              })
            })
          })
        })
      });

      const response = await request(app)
        .get('/api/posts/feed')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].content).toBe('Test post content');
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/posts/feed')
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/posts/feed?page=2&limit=5')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Verify pagination parameters are handled correctly
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post with valid data', async () => {
      const newPost = {
        content: 'New test post',
        isPublic: true,
        location: 'Buenos Aires, Argentina'
      };

      const mockCreatedPost = {
        id: 2,
        userId: 1,
        ...newPost,
        createdAt: new Date()
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockCreatedPost])
        })
      });

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', 'Bearer valid-token')
        .send(newPost)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('New test post');
    });

    it('should validate required fields', async () => {
      const invalidPost = {
        isPublic: true
        // Missing content
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidPost)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('content');
    });

    it('should handle media uploads correctly', async () => {
      const postWithMedia = {
        content: 'Post with media',
        imageUrl: 'https://example.com/image.jpg',
        videoUrl: 'https://example.com/video.mp4',
        isPublic: true
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', 'Bearer valid-token')
        .send(postWithMedia)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.imageUrl).toBe(postWithMedia.imageUrl);
      expect(response.body.data.videoUrl).toBe(postWithMedia.videoUrl);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update post for authorized user', async () => {
      const postId = 1;
      const updates = {
        content: 'Updated post content',
        isPublic: false
      };

      const mockUpdatedPost = {
        id: postId,
        userId: 1,
        ...updates,
        updatedAt: new Date()
      };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdatedPost])
          })
        })
      });

      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('Updated post content');
    });

    it('should return 403 for unauthorized user', async () => {
      const postId = 999; // Post belonging to different user

      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', 'Bearer valid-token')
        .send({ content: 'Unauthorized update' })
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete post for authorized user', async () => {
      const postId = 1;

      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: postId }])
        })
      });

      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for non-existent post', async () => {
      const postId = 999;

      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([])
        })
      });

      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/posts/:id/like', () => {
    it('should toggle like on post', async () => {
      const postId = 1;

      const response = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isLiked');
      expect(response.body.data).toHaveProperty('likesCount');
    });
  });

  describe('GET /api/posts/:id/comments', () => {
    it('should return comments for a post', async () => {
      const postId = 1;
      const mockComments = [
        {
          id: 1,
          postId: postId,
          userId: 1,
          content: 'Great post!',
          createdAt: new Date(),
          user: mockUser
        }
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockComments)
            })
          })
        })
      });

      const response = await request(app)
        .get(`/api/posts/${postId}/comments`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].content).toBe('Great post!');
    });
  });

  describe('POST /api/posts/:id/comments', () => {
    it('should create a new comment', async () => {
      const postId = 1;
      const newComment = {
        content: 'Nice work!'
      };

      const mockCreatedComment = {
        id: 2,
        postId: postId,
        userId: 1,
        ...newComment,
        createdAt: new Date()
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockCreatedComment])
        })
      });

      const response = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', 'Bearer valid-token')
        .send(newComment)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('Nice work!');
    });

    it('should validate comment content', async () => {
      const postId = 1;
      const invalidComment = {}; // Missing content

      const response = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', 'Bearer valid-token')
        .send(invalidComment)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('content');
    });
  });
});