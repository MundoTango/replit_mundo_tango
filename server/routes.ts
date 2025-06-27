import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { authMiddleware } from "./middleware/auth";
import { setupUpload } from "./middleware/upload";
import { SocketService } from "./services/socketService";
import { z } from "zod";
import { insertUserSchema, insertPostSchema, insertEventSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "mundo-tango-secret-key";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const socketService = new SocketService(wss);

  // Setup file upload middleware
  const upload = setupUpload();

  // Helper function to generate JWT token
  const generateToken = (userId: number) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  };

  // Auth routes
  app.post("/api/user", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(user.id);
      await storage.updateUserApiToken(user.id, token);

      res.status(201).json({
        success: true,
        data: {
          user: { ...user, password: undefined },
          api_token: token,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/user/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id);
      await storage.updateUserApiToken(user.id, token);

      res.json({
        success: true,
        data: {
          user: { ...user, password: undefined },
          api_token: token,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User profile routes
  app.get("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stats = await storage.getUserStats(user.id);
      
      res.json({
        success: true,
        data: {
          user: { ...user, password: undefined },
          stats,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/user", authMiddleware, upload.fields([
    { name: 'image_url', maxCount: 1 },
    { name: 'background_url', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const updates: any = { ...req.body };
      
      // Handle file uploads
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files?.image_url?.[0]) {
        updates.profileImage = `/uploads/${files.image_url[0].filename}`;
      }
      if (files?.background_url?.[0]) {
        updates.backgroundImage = `/uploads/${files.background_url[0].filename}`;
      }

      const user = await storage.updateUser(req.user!.id, updates);
      
      res.json({
        success: true,
        data: { ...user, password: undefined },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Posts routes
  app.post("/api/posts", authMiddleware, upload.single('image'), async (req, res) => {
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: req.user!.id,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      });

      const post = await storage.createPost(postData);
      
      // Emit to connected clients
      socketService.broadcastToFollowers(req.user!.id, 'new_post', post);

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/posts/feed", authMiddleware, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getFeedPosts(req.user!.id, limit, offset);
      
      res.json({
        success: true,
        data: posts,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/posts/:id/like", authMiddleware, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.likePost(postId, req.user!.id);
      
      res.json({
        success: true,
        message: "Post liked successfully",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/posts/:id/like", authMiddleware, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.unlikePost(postId, req.user!.id);
      
      res.json({
        success: true,
        message: "Post unliked successfully",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/posts/:id/comment", authMiddleware, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { content } = req.body;
      
      const comment = await storage.commentOnPost(postId, req.user!.id, content);
      
      res.json({
        success: true,
        data: comment,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getPostComments(postId);
      
      res.json({
        success: true,
        data: comments,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Events routes
  app.post("/api/events", authMiddleware, upload.single('image'), async (req, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        userId: req.user!.id,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      });

      const event = await storage.createEvent(eventData);
      
      res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const events = await storage.getEvents(limit, offset);
      
      res.json({
        success: true,
        data: events,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/events/:id/rsvp", authMiddleware, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { status } = req.body; // 'going', 'interested', 'not_going'
      
      const rsvp = await storage.rsvpEvent(eventId, req.user!.id, status);
      
      res.json({
        success: true,
        data: rsvp,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Follow routes
  app.post("/api/users/:id/follow", authMiddleware, async (req, res) => {
    try {
      const followingId = parseInt(req.params.id);
      const follow = await storage.followUser(req.user!.id, followingId);
      
      res.json({
        success: true,
        data: follow,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/users/:id/follow", authMiddleware, async (req, res) => {
    try {
      const followingId = parseInt(req.params.id);
      await storage.unfollowUser(req.user!.id, followingId);
      
      res.json({
        success: true,
        message: "User unfollowed successfully",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stories routes
  app.post("/api/stories", authMiddleware, upload.single('media'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Media file is required" });
      }

      const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      const story = await storage.createStory(
        req.user!.id,
        `/uploads/${req.file.filename}`,
        mediaType,
        req.body.caption
      );
      
      res.status(201).json({
        success: true,
        data: story,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stories/following", authMiddleware, async (req, res) => {
    try {
      const stories = await storage.getFollowingStories(req.user!.id);
      
      res.json({
        success: true,
        data: stories,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/stories/:id/view", authMiddleware, async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      await storage.viewStory(storyId, req.user!.id);
      
      res.json({
        success: true,
        message: "Story view recorded",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Search routes
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const type = req.query.type as string || 'all';
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const results: any = {};

      if (type === 'all' || type === 'users') {
        results.users = await storage.searchUsers(query);
      }

      if (type === 'all' || type === 'posts') {
        results.posts = await storage.searchPosts(query);
      }

      res.json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chat routes
  app.get("/api/chat/rooms", authMiddleware, async (req, res) => {
    try {
      const rooms = await storage.getUserChatRooms(req.user!.id);
      
      res.json({
        success: true,
        data: rooms,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chat/rooms/:slug/messages", authMiddleware, async (req, res) => {
    try {
      const { slug } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const messages = await storage.getChatMessages(slug, limit);
      
      res.json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // File upload route
  app.post("/api/upload", authMiddleware, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      res.json({
        success: true,
        data: {
          url: `/uploads/${req.file.filename}`,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use('/uploads', require('express').static('uploads'));

  return httpServer;
}
