import { Express } from "express";
import { createServer, type Server } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { authMiddleware } from "./middleware/auth";
import { setupUpload } from "./middleware/upload";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertEventSchema, insertChatRoomSchema, insertChatMessageSchema } from "../shared/schema";
import { z } from "zod";
import { SocketService } from "./services/socketService";
import { WebSocketServer } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up file upload middleware
  const upload = setupUpload();

  // User Authentication Routes - exactly matching original backend
  app.post("/api/user", upload.any(), async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse({
        name: req.body.name,
        username: req.body.username || req.body.name,
        email: req.body.email,
        password: req.body.password,
        bio: req.body.bio,
        firstName: req.body.firstname,
        lastName: req.body.lastname,
        mobileNo: req.body.mobile_no,
        country: req.body.country,
        city: req.body.city,
        facebookUrl: req.body.facebook_url,
      });

      const user = await storage.createUser(validatedData);
      
      // Generate JWT token like original backend
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "mundo-tango-secret",
        { expiresIn: "7d" }
      );

      await storage.updateUserApiToken(user.id, token);

      res.json({ 
        success: true, 
        message: "User registered successfully",
        data: { 
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            bio: user.bio || null,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            mobileNo: user.mobileNo || null,
            profileImage: user.profileImage || null,
            backgroundImage: user.backgroundImage || null,
            country: user.country || null,
            city: user.city || null,
            facebookUrl: user.facebookUrl || null,
            isVerified: user.isVerified || false,
            isActive: user.isActive || true,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          api_token: token
        } 
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  app.post("/api/user/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "mundo-tango-secret",
        { expiresIn: "7d" }
      );

      await storage.updateUserApiToken(user.id, token);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            bio: user.bio,
            firstName: user.firstName,
            lastName: user.lastName,
            mobileNo: user.mobileNo,
            profileImage: user.profileImage,
            backgroundImage: user.backgroundImage,
            country: user.country,
            city: user.city,
            facebookUrl: user.facebookUrl,
            isVerified: user.isVerified,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          api_token: token,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            bio: user.bio,
            firstName: user.firstName,
            lastName: user.lastName,
            mobileNo: user.mobileNo,
            profileImage: user.profileImage,
            backgroundImage: user.backgroundImage,
            country: user.country,
            city: user.city,
            facebookUrl: user.facebookUrl,
            isVerified: user.isVerified,
            isActive: user.isActive,
            apiToken: user.apiToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.patch("/api/user", authMiddleware, upload.any(), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const profileImageFile = files?.find(file => file.fieldname === 'image_url');
      const backgroundImageFile = files?.find(file => file.fieldname === 'background_url');
      
      const updateData: any = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.bio) updateData.bio = req.body.bio;
      if (req.body.country) updateData.country = req.body.country;
      if (req.body.city) updateData.city = req.body.city;
      if (req.body.facebook_url) updateData.facebookUrl = req.body.facebook_url;
      if (profileImageFile) updateData.profileImage = `/uploads/${profileImageFile.filename}`;
      if (backgroundImageFile) updateData.backgroundImage = `/uploads/${backgroundImageFile.filename}`;

      const updatedUser = await storage.updateUser(req.user!.id, updateData);
      
      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedUser }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  app.get("/api/user/get-all-users", authMiddleware, async (req, res) => {
    try {
      const query = req.query.search as string;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const users = await storage.searchUsers(query || "", limit);
      res.json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Posts routes - matching original backend structure
  app.get("/api/post", authMiddleware, async (req, res) => {
    try {
      const userId = req.user!.id;
      const visibility = req.query.visibility as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getFeedPosts(userId, limit, offset);
      res.json({ success: true, data: { rows: posts, count: posts.length } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/posts/feed", authMiddleware, async (req, res) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getFeedPosts(userId, limit, offset);
      res.json({ success: true, data: posts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/post", authMiddleware, upload.any(), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const imageFile = files?.find(file => file.fieldname === 'attachments' || file.fieldname === 'image');
      const videoFile = files?.find(file => file.fieldname === 'video');
      
      const validatedData = insertPostSchema.parse({
        userId: req.user!.id,
        content: req.body.content,
        imageUrl: imageFile ? `/uploads/${imageFile.filename}` : undefined,
        videoUrl: videoFile ? `/uploads/${videoFile.filename}` : undefined,
        hashtags: req.body.hashtags ? req.body.hashtags.split(',') : [],
        isPublic: req.body.visibility !== 'private',
      });

      const post = await storage.createPost(validatedData);
      res.json({ success: true, message: "Post created successfully", data: { post } });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // Post likes
  app.post("/api/post-like", authMiddleware, async (req, res) => {
    try {
      const { post_id } = req.body;
      await storage.likePost(parseInt(post_id), req.user!.id);
      res.json({ success: true, message: "Post liked successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  app.delete("/api/post-like/:id", authMiddleware, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.unlikePost(postId, req.user!.id);
      res.json({ success: true, message: "Post unliked successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // Post comments
  app.post("/api/post-comment", authMiddleware, async (req, res) => {
    try {
      const { post_id, content } = req.body;
      const comment = await storage.commentOnPost(parseInt(post_id), req.user!.id, content);
      res.json({ success: true, message: "Comment added successfully", data: { comment } });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  app.get("/api/post-comment", authMiddleware, async (req, res) => {
    try {
      const postId = parseInt(req.query.post_id as string);
      const comments = await storage.getPostComments(postId);
      res.json({ success: true, data: comments });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Events routes - matching original backend
  app.get("/api/event", authMiddleware, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const events = await storage.getEvents(limit, offset);
      res.json({ success: true, data: events });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/events", authMiddleware, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const events = await storage.getEvents(limit, offset);
      res.json({ success: true, data: events });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/event", authMiddleware, upload.any(), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const imageFile = files?.find(file => file.fieldname === 'image_url' || file.fieldname === 'image');
      
      const validatedData = insertEventSchema.parse({
        userId: req.user!.id,
        title: req.body.name || req.body.title,
        description: req.body.description,
        imageUrl: imageFile ? `/uploads/${imageFile.filename}` : undefined,
        startDate: new Date(req.body.start_date || req.body.startDate),
        endDate: req.body.end_date ? new Date(req.body.end_date || req.body.endDate) : undefined,
        location: req.body.location,
        price: req.body.price,
        maxAttendees: req.body.max_attendees ? parseInt(req.body.max_attendees) : undefined,
        isPublic: req.body.visibility !== 'private',
      });

      const event = await storage.createEvent(validatedData);
      res.json({ success: true, message: "Event created successfully", data: { event } });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // Friends/Following routes
  app.post("/api/friend", authMiddleware, async (req, res) => {
    try {
      const { friend_id } = req.body;
      const follow = await storage.followUser(req.user!.id, parseInt(friend_id));
      res.json({ success: true, message: "User followed successfully", data: { follow } });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  app.delete("/api/friend/:id", authMiddleware, async (req, res) => {
    try {
      const friendId = parseInt(req.params.id);
      await storage.unfollowUser(req.user!.id, friendId);
      res.json({ success: true, message: "User unfollowed successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  app.get("/api/friend", authMiddleware, async (req, res) => {
    try {
      const userId = req.user!.id;
      const followers = await storage.getFollowers(userId);
      const following = await storage.getFollowing(userId);
      res.json({ success: true, data: { followers, following } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Stories routes
  app.get("/api/stories/following", authMiddleware, async (req, res) => {
    try {
      const userId = req.user!.id;
      const stories = await storage.getFollowingStories(userId);
      res.json({ success: true, data: stories });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/story", authMiddleware, upload.any(), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const mediaFile = files?.find(file => file.fieldname === 'media');
      
      if (!mediaFile) {
        return res.status(400).json({ success: false, message: "Media file is required" });
      }

      const mediaType = mediaFile.mimetype.startsWith('video/') ? 'video' : 'image';
      const story = await storage.createStory(
        req.user!.id,
        `/uploads/${mediaFile.filename}`,
        mediaType,
        req.body.caption
      );
      
      res.json({ success: true, message: "Story created successfully", data: { story } });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // Chat routes
  app.get("/api/chat-rooms", authMiddleware, async (req, res) => {
    try {
      const userId = req.user!.id;
      const chatRooms = await storage.getUserChatRooms(userId);
      res.json({ success: true, data: chatRooms });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/chat/:slug/messages", authMiddleware, async (req, res) => {
    try {
      const roomSlug = req.params.slug;
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(roomSlug, limit);
      res.json({ success: true, data: messages });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  const server = createServer(app);

  // WebSocket setup for real-time features - use different port to avoid Vite conflicts
  const wss = new WebSocketServer({ port: 8080 });
  new SocketService(wss);

  return server;
}