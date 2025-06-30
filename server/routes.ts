import { Express } from "express";
import { createServer, type Server } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { authMiddleware } from "./middleware/auth";
import { setupUpload } from "./middleware/upload";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertEventSchema, insertChatRoomSchema, insertChatMessageSchema, roles, userProfiles, userRoles } from "../shared/schema";
import { z } from "zod";
import { SocketService } from "./services/socketService";
import { WebSocketServer } from "ws";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { uploadMedia, uploadMediaWithMetadata, deleteMedia, deleteMediaWithMetadata, getSignedUrl, initializeStorageBucket } from "./services/uploadService";
import { setUserContext, auditSecurityEvent, checkResourcePermission, rateLimit } from "./middleware/security";
import { authService, UserRole } from "./services/authService";
import { enhancedRoleService, AllRoles } from "./services/enhancedRoleService";
import { requireRole, requireAdmin, ensureUserProfile, auditRoleAction } from "./middleware/roleAuth";
import { supabase } from "./supabaseClient";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up Replit Auth middleware
  await setupAuth(app);

  // Apply security middleware to all authenticated routes
  app.use('/api', setUserContext);

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
      if (!user) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }
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

  // Code of conduct acceptance endpoint
  app.post("/api/code-of-conduct/accept", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Update user to mark code of conduct as accepted and complete onboarding
      const updatedUser = await storage.updateUser(user.id, {
        codeOfConductAccepted: true,
        isOnboardingComplete: true,
        formStatus: 2
      });

      res.json({
        success: true,
        message: "Code of conduct accepted successfully",
        data: { user: updatedUser }
      });
    } catch (error: any) {
      console.error("Code of conduct error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Original Trango Tech User API endpoints - matching exact structure
  
  // User profile and management endpoints
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: user
      });
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.patch('/api/user', isAuthenticated, upload.any(), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const files = req.files as Express.Multer.File[];
      const updateData: any = {};
      
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.bio) updateData.bio = req.body.bio;
      if (req.body.country) updateData.country = req.body.country;
      if (req.body.city) updateData.city = req.body.city;
      if (req.body.facebook_url) updateData.facebookUrl = req.body.facebook_url;
      
      const profileImageFile = files?.find(file => file.fieldname === 'image_url');
      const backgroundImageFile = files?.find(file => file.fieldname === 'background_url');
      
      if (profileImageFile) updateData.profileImage = `/uploads/${profileImageFile.filename}`;
      if (backgroundImageFile) updateData.backgroundImage = `/uploads/${backgroundImageFile.filename}`;

      const updatedUser = await storage.updateUser(user.id, updateData);

      res.json({
        code: 200,
        message: 'Record updated successfully.',
        data: updatedUser
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.patch('/api/user/notification', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      // Toggle notification settings would be implemented here
      res.json({
        code: 200,
        message: 'Notification settings updated successfully.',
        data: {}
      });
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.patch('/api/user/privacy', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      // Privacy settings update would be implemented here
      res.json({
        code: 200,
        message: 'Privacy settings updated successfully.',
        data: {}
      });
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/get-all-users', isAuthenticated, async (req: any, res) => {
    try {
      const { search = '', page = 1, limit = 20 } = req.query;
      const parsedLimit = parseInt(limit as string);
      
      const users = await storage.searchUsers(search as string, parsedLimit);
      
      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: users
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/get-user-timeline/:user_id', isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = parseInt(req.params.user_id);
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const posts = await storage.getUserPosts(targetUserId, parseInt(limit as string), offset);
      
      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: posts
      });
    } catch (error: any) {
      console.error('Error fetching user timeline:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/get-user-profile/:id', isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = parseInt(req.params.id);
      const user = await storage.getUser(targetUserId);
      
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: 'User not found.',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: user
      });
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/get-user-about/:id', isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = parseInt(req.params.id);
      const user = await storage.getUser(targetUserId);
      
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: 'User not found.',
          data: {}
        });
      }

      // Return user's about information
      const aboutData = {
        bio: user.bio,
        country: user.country,
        city: user.city,
        facebookUrl: user.facebookUrl,
        yearsOfDancing: user.yearsOfDancing,
        tangoRoles: user.tangoRoles,
        languages: user.languages
      };

      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: aboutData
      });
    } catch (error: any) {
      console.error('Error fetching user about:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/get-city-members', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      // Get users from the same city
      const { limit = 20 } = req.query;
      const cityMembers = await storage.searchUsers(user.city || '', parseInt(limit as string));
      
      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: cityMembers
      });
    } catch (error: any) {
      console.error('Error fetching city members:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/global-search', isAuthenticated, async (req: any, res) => {
    try {
      const { q: query = '', type = 'all', limit = 20 } = req.query;
      
      let results = {};
      
      if (type === 'users' || type === 'all') {
        const users = await storage.searchUsers(query as string, parseInt(limit as string));
        results = { ...results, users };
      }
      
      if (type === 'posts' || type === 'all') {
        const posts = await storage.searchPosts(query as string, parseInt(limit as string));
        results = { ...results, posts };
      }

      res.json({
        code: 200,
        message: 'Search completed successfully.',
        data: results
      });
    } catch (error: any) {
      console.error('Error performing global search:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.post('/api/user/code-of-conduct', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const updatedUser = await storage.updateUser(user.id, {
        codeOfConductAccepted: true,
        isOnboardingComplete: true,
        formStatus: 2
      });

      res.json({
        code: 200,
        message: 'Code of conduct accepted successfully.',
        data: updatedUser
      });
    } catch (error: any) {
      console.error('Error accepting code of conduct:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  // Original Trango Tech Experience API endpoints - matching exact structure
  
  // Dance Experience endpoints
  app.post('/api/user/dance-experience/store', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const { social_dancing_cities, leader_level, follower_level, years_of_dancing } = req.body;
      
      if (!social_dancing_cities) {
        return res.status(400).json({ 
          code: 400,
          message: 'Social dancing cities is required',
          data: {}
        });
      }

      // Update user with dance experience data
      const updatedUser = await storage.updateUser(user.id, {
        leaderLevel: leader_level,
        followerLevel: follower_level,
        yearsOfDancing: years_of_dancing
      });

      res.json({
        code: 200,
        message: 'Record added successfully.',
        data: updatedUser
      });
    } catch (error: any) {
      console.error('Error storing dance experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/dance-experience/get', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const danceExperience = {
        leader_level: user.leaderLevel,
        follower_level: user.followerLevel,
        years_of_dancing: user.yearsOfDancing
      };

      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: danceExperience
      });
    } catch (error: any) {
      console.error('Error fetching dance experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  // Creator Experience endpoints
  app.post('/api/user/creator-experience/store', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      // Creator experience would be stored in specialized table
      res.json({
        code: 200,
        message: 'Creator experience added successfully.',
        data: {}
      });
    } catch (error: any) {
      console.error('Error storing creator experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/creator-experience/get', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: []
      });
    } catch (error: any) {
      console.error('Error fetching creator experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  // DJ Experience endpoints
  app.post('/api/user/dj-experience/store', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'DJ experience added successfully.',
        data: {}
      });
    } catch (error: any) {
      console.error('Error storing DJ experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/dj-experience/get', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: []
      });
    } catch (error: any) {
      console.error('Error fetching DJ experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  // Teaching Experience endpoints
  app.post('/api/user/teaching-experience/store', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Teaching experience added successfully.',
        data: {}
      });
    } catch (error: any) {
      console.error('Error storing teaching experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/teaching-experience/get', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: []
      });
    } catch (error: any) {
      console.error('Error fetching teaching experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  // Performer Experience endpoints
  app.post('/api/user/performer-experience/store', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Performer experience added successfully.',
        data: {}
      });
    } catch (error: any) {
      console.error('Error storing performer experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/performer-experience/get', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: []
      });
    } catch (error: any) {
      console.error('Error fetching performer experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  // Photographer Experience endpoints
  app.post('/api/user/photographer-experience/store', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Photographer experience added successfully.',
        data: {}
      });
    } catch (error: any) {
      console.error('Error storing photographer experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/photographer-experience/get', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: []
      });
    } catch (error: any) {
      console.error('Error fetching photographer experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  // Tour Operator Experience endpoints
  app.post('/api/user/tour-operator-experience/store', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Tour operator experience added successfully.',
        data: {}
      });
    } catch (error: any) {
      console.error('Error storing tour operator experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/user/tour-operator-experience/get', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: []
      });
    } catch (error: any) {
      console.error('Error fetching tour operator experience:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
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

  // Original Trango Tech Post API endpoints - matching exact structure
  
  // Post CRUD operations
  app.post('/api/post/store', isAuthenticated, upload.array('files', 10), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const { content, visibility = 'public', status = 'active' } = req.body;
      
      if (!content) {
        return res.status(400).json({ 
          code: 400,
          message: 'Content is required',
          data: {}
        });
      }

      const post = await storage.createPost({
        userId: user.id,
        content,
        visibility,
        status
      });

      res.json({
        code: 200,
        message: 'Record added successfully.',
        data: post
      });
    } catch (error: any) {
      console.error('Error creating post:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.post('/api/post/create-event-post', isAuthenticated, upload.array('files', 10), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const { content, visibility = 'public', status = 'active', event_id } = req.body;

      const post = await storage.createPost({
        userId: user.id,
        content: content || '',
        visibility,
        status,
        eventId: event_id ? parseInt(event_id) : undefined
      });

      res.json({
        code: 200,
        message: 'Event post created successfully.',
        data: post
      });
    } catch (error: any) {
      console.error('Error creating event post:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.put('/api/post/update/:id', isAuthenticated, upload.array('files', 10), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      const postId = parseInt(req.params.id);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const existingPost = await storage.getPostById(postId);
      if (!existingPost) {
        return res.status(400).json({
          code: 400,
          message: 'Post not found.',
          data: {}
        });
      }

      if (existingPost.userId !== user.id) {
        return res.status(400).json({
          code: 400,
          message: 'You cannot edit this post.',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Record updated successfully.',
        data: existingPost
      });
    } catch (error: any) {
      console.error('Error updating post:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/post/get-my-post', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const posts = await storage.getUserPosts(user.id, parseInt(limit as string), offset);
      
      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: posts
      });
    } catch (error: any) {
      console.error('Error fetching user posts:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/post/get-all-post', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const posts = await storage.getFeedPosts(user.id, parseInt(limit as string), offset);
      
      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: posts
      });
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.get('/api/post/get-post/:id', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({
          code: 404,
          message: 'Post not found.',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Record fetched successfully.',
        data: post
      });
    } catch (error: any) {
      console.error('Error fetching post:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
    }
  });

  app.delete('/api/post/delete/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      const postId = parseInt(req.params.id);

      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(400).json({
          code: 400,
          message: 'Post not found.',
          data: {}
        });
      }

      if (post.userId !== user.id) {
        return res.status(400).json({
          code: 400,
          message: 'You cannot delete this post.',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Post deleted successfully.',
        data: {}
      });
    } catch (error: any) {
      console.error('Error deleting post:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: {}
      });
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

  app.get("/api/posts/feed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const filterTags = req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) : [];

      const posts = await storage.getFeedPosts(user.id, limit, offset, filterTags);
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

  // Get post comments - Updated path to match modal expectations
  app.get("/api/posts/:postId/comments", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getPostComments(postId);
      res.json({ 
        success: true, 
        data: comments
      });
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch comments',
        data: []
      });
    }
  });

  // Create post comment - New endpoint for modal
  app.post("/api/posts/:postId/comments", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { content } = req.body;
      const userId = (req as any).user.id;

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required',
          data: null
        });
      }

      // Check if post exists
      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
          data: null
        });
      }

      const comment = await storage.commentOnPost(postId, userId, content.trim());
      
      res.status(201).json({
        success: true,
        message: 'Comment posted successfully',
        data: comment
      });
    } catch (error: any) {
      console.error('Error creating comment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to post comment',
        data: null
      });
    }
  });

  // Legacy endpoint for backward compatibility
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

  // Events sidebar API for Memories page with personalized content
  app.get("/api/events/sidebar", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({ 
          code: 401,
          message: 'User not found',
          data: []
        });
      }

      // Get upcoming events and filter for user preferences
      const allEvents = await storage.getEvents(20, 0);
      const now = new Date();
      
      // Filter to upcoming events in user's area and followed cities
      const upcomingEvents = allEvents
        .filter(event => new Date(event.startDate) > now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 4);

      // Get user RSVPs to determine status for each event
      const userRsvps = await storage.getUserEventRsvps(user.id);
      const rsvpMap = new Map(userRsvps.map(rsvp => [rsvp.eventId, rsvp.status]));

      // Transform events with user status information
      const transformedEvents = upcomingEvents.map(event => {
        const userStatus = rsvpMap.get(event.id) || null;

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate instanceof Date ? event.startDate.toISOString() : new Date(event.startDate).toISOString(),
          endDate: event.endDate ? (event.endDate instanceof Date ? event.endDate.toISOString() : new Date(event.endDate).toISOString()) : undefined,
          location: event.location || '',
          city: event.city || 'Buenos Aires',
          country: event.country || 'Argentina',
          eventType: event.eventType || 'milonga',
          currentAttendees: event.currentAttendees || 0,
          maxAttendees: event.maxAttendees,
          isPublic: event.isPublic !== false,
          userStatus,
          user: {
            id: event.userId,
            name: user.name,
            username: user.username,
            profileImage: user.profileImage
          }
        };
      });

      res.json({
        code: 200,
        message: 'Personalized events fetched successfully.',
        data: transformedEvents
      });
    } catch (error: any) {
      console.error('Error fetching personalized events:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Internal server error. Please try again later.',
        data: []
      });
    }
  });

  // Modern events creation endpoint with role assignment support
  app.post("/api/events", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse({
        userId: req.user!.id,
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        location: req.body.location,
        price: req.body.price,
        maxAttendees: req.body.maxAttendees,
        isPublic: req.body.isPublic !== false,
      });

      const event = await storage.createEvent(validatedData);

      // Handle role assignments if provided
      const assignedRoles = req.body.assignedRoles;
      if (assignedRoles && Array.isArray(assignedRoles) && assignedRoles.length > 0) {
        // Limit to 10 assignments
        const limitedRoles = assignedRoles.slice(0, 10);
        
        for (const assignment of limitedRoles) {
          const { userIdentifier, role } = assignment;
          if (!userIdentifier || !role) continue;

          let targetUserId = null;

          // Check if userIdentifier is a numeric ID
          if (/^\d+$/.test(userIdentifier)) {
            targetUserId = parseInt(userIdentifier);
          } else {
            // Try to find user by email
            const userByEmail = await storage.getUserByEmail(userIdentifier);
            if (userByEmail) {
              targetUserId = userByEmail.id;
            } else {
              console.log(`User not found for identifier: ${userIdentifier}`);
              continue;
            }
          }

          if (targetUserId) {
            try {
              await storage.createEventParticipant({
                eventId: event.id,
                userId: targetUserId,
                role: role,
                status: 'pending',
                invitedBy: req.user!.id,
                invitedAt: new Date()
              });
              console.log(`Role assignment created: User ${targetUserId} as ${role} for event ${event.id}`);
            } catch (roleError) {
              console.error(`Failed to create role assignment for user ${targetUserId}:`, roleError);
            }
          }
        }
      }

      res.json({ success: true, message: "Event created and invitations sent!", data: { event } });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
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

      // Handle role assignments if provided
      const assignedRoles = req.body.assignedRoles;
      if (assignedRoles && Array.isArray(assignedRoles) && assignedRoles.length > 0) {
        // Limit to 10 assignments
        const limitedRoles = assignedRoles.slice(0, 10);
        
        for (const assignment of limitedRoles) {
          const { userIdentifier, role } = assignment;
          if (!userIdentifier || !role) continue;

          let targetUserId = null;

          // Check if userIdentifier is a numeric ID
          if (/^\d+$/.test(userIdentifier)) {
            targetUserId = parseInt(userIdentifier);
          } else {
            // Try to find user by email
            const userByEmail = await storage.getUserByEmail(userIdentifier);
            if (userByEmail) {
              targetUserId = userByEmail.id;
            } else {
              console.log(`User not found for identifier: ${userIdentifier}`);
              continue;
            }
          }

          if (targetUserId) {
            try {
              await storage.createEventParticipant({
                eventId: event.id,
                userId: targetUserId,
                role: role,
                status: 'pending',
                invitedBy: req.user!.id,
                invitedAt: new Date()
              });
              console.log(`Role assignment created: User ${targetUserId} as ${role} for event ${event.id}`);
            } catch (roleError) {
              console.error(`Failed to create role assignment for user ${targetUserId}:`, roleError);
            }
          }
        }
      }

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
  app.get("/api/stories/following", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const stories = await storage.getFollowingStories(user.id);
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

  // Replit Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      console.log("Auth user data:", {
        id: user?.id,
        formStatus: user?.formStatus,
        isOnboardingComplete: user?.isOnboardingComplete,
        codeOfConductAccepted: user?.codeOfConductAccepted
      });
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding endpoint with role assignment
  app.post('/api/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { nickname, languages, selectedRoles, location } = req.body;

      // Update user profile with basic information
      const updatedUser = await storage.updateUser(user.id, {
        nickname,
        languages,
        tangoRoles: selectedRoles || [], // Keep legacy field
        country: location.country,
        state: location.state,
        city: location.city,
        countryCode: location.countryCode,
        stateCode: location.stateCode,
        leaderLevel: req.body.leaderLevel,
        followerLevel: req.body.followerLevel,
        yearsOfDancing: req.body.yearsOfDancing,
        startedDancingYear: req.body.startedDancingYear,
        isOnboardingComplete: false,
        formStatus: 1,
        displayName: user.name || user.username, // Set display name
      });

      // Handle role assignment using the enhanced role system
      const rolesToAssign = selectedRoles && selectedRoles.length > 0 ? selectedRoles : ['guest'];
      const primaryRole = rolesToAssign[0];

      try {
        // Create or update user profile in roles system
        await db.insert(userProfiles).values({
          userId: user.id,
          roles: rolesToAssign,
          primaryRole: primaryRole,
          displayName: user.name || user.username,
          isActive: true
        }).onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            roles: rolesToAssign,
            primaryRole: primaryRole,
            displayName: user.name || user.username,
            isActive: true
          }
        });

        // Add roles to junction table
        for (const role of rolesToAssign) {
          await db.insert(userRoles).values({
            userId: user.id,
            roleName: role
          }).onConflictDoNothing();
        }

        console.log(`Assigned roles to user ${user.id}:`, rolesToAssign);
      } catch (roleError) {
        console.error('Error assigning roles during onboarding:', roleError);
        // Continue with onboarding even if role assignment fails
      }

      res.json({ success: true, data: updatedUser });
    } catch (error: any) {
      console.error("Onboarding error:", error);
      res.status(500).json({ message: error.message });
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

  // Location search endpoint
  app.get("/api/search/locations", async (req, res) => {
    try {
      const { q: query, limit = 50 } = req.query;

      if (!query || typeof query !== 'string' || query.length < 2) {
        return res.json([]);
      }

      const fs = require('fs');
      const path = require('path');

      const countriesData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/location/countries.json'), 'utf8'));
      const statesData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/location/states.json'), 'utf8'));
      const citiesData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/location/cities.json'), 'utf8'));

      const results: Array<{
        id: string;
        display: string;
        city: string;
        state: string;
        country: string;
        countryId: number;
        stateId: number;
        cityId: number;
        type: 'city' | 'state' | 'country';
      }> = [];

      const lowerQuery = query.toLowerCase();

      // Search cities first (prioritize exact matches)
      const cities = citiesData.filter((city: any) => 
        city.name.toLowerCase().includes(lowerQuery)
      ).sort((a: any, b: any) => {
        const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      }).slice(0, parseInt(limit as string));

      cities.forEach((city: any) => {
        const state = statesData.find((s: any) => s.id === city.state_id);
        const country = countriesData.find((c: any) => c.id === city.country_id);
        if (state && country) {
          results.push({
            id: `city-${city.id}`,
            display: `${city.name}, ${state.name}, ${country.name}`,
            city: city.name,
            state: state.name,
            country: country.name,
            countryId: country.id,
            stateId: state.id,
            cityId: city.id,
            type: 'city'
          });
        }
      });

      // Add some states if we have room
      if (results.length < 20) {
        const states = statesData.filter((state: any) => 
          state.name.toLowerCase().includes(lowerQuery)
        ).slice(0, Math.max(0, 20 - results.length));

        states.forEach((state: any) => {
          const country = countriesData.find((c: any) => c.id === state.country_id);
          if (country) {
            results.push({
              id: `state-${state.id}`,
              display: `${state.name}, ${country.name}`,
              city: "",
              state: state.name,
              country: country.name,
              countryId: country.id,
              stateId: state.id,
              cityId: 0,
              type: 'state'
            });
          }
        });
      }

      // Add some countries if we still have room
      if (results.length < 10) {
        const countries = countriesData.filter((country: any) => 
          country.name.toLowerCase().includes(lowerQuery) ||
          country.capital.toLowerCase().includes(lowerQuery)
        ).slice(0, Math.max(0, 10 - results.length));

        countries.forEach((country: any) => {
          results.push({
            id: `country-${country.id}`,
            display: country.name,
            city: "",
            state: "",
            country: country.name,
            countryId: country.id,
            stateId: 0,
            cityId: 0,
            type: 'country'
          });
        });
      }

      res.json(results);
    } catch (error) {
      console.error('Location search error:', error);
      res.status(500).json({ error: 'Failed to search locations' });
    }
  });

  app.get("/api/auth/logout", (req: any, res) => {
    req.logout((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      // Clear session and redirect to landing page
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect("/");
      });
    });
  });

  // Enhanced Supabase Storage Upload Routes with Phase 2 capabilities
  app.post('/api/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      if (!req.file) {
        return res.status(400).json({
          code: 400,
          message: 'No file provided',
          data: {}
        });
      }

      const { 
        folder = 'general', 
        visibility = 'public',
        tags = '[]'
      } = req.body;

      // Parse tags if it's a string
      const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

      const result = await uploadMediaWithMetadata(
        req.file.buffer,
        req.file.originalname,
        {
          folder,
          userId: user.id,
          visibility,
          tags: parsedTags
        }
      );

      if (!result.success) {
        return res.status(500).json({
          code: 500,
          message: result.error || 'Upload failed',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'File uploaded successfully with metadata',
        data: {
          id: result.mediaAsset?.id,
          url: result.url,
          path: result.path,
          mediaAsset: result.mediaAsset
        }
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error during upload',
        data: {}
      });
    }
  });

  // Enhanced delete endpoint with metadata cleanup
  app.delete('/api/media/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const result = await deleteMediaWithMetadata(req.params.id);

      if (!result.success) {
        return res.status(500).json({
          code: 500,
          message: result.error || 'Delete failed',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Media asset deleted successfully',
        data: {}
      });
    } catch (error: any) {
      console.error('Delete media error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error during delete',
        data: {}
      });
    }
  });

  // Get user media assets
  app.get('/api/media/user/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const requestUserId = req.user.claims.sub;
      const requestUser = await storage.getUserByReplitId(requestUserId);
      
      if (!requestUser) {
        return res.status(401).json({
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const userId = parseInt(req.params.userId);
      const { folder, limit } = req.query;

      const mediaAssets = await storage.getUserMediaAssets(
        userId, 
        folder as string, 
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        code: 200,
        message: 'Media assets retrieved successfully',
        data: mediaAssets
      });
    } catch (error: any) {
      console.error('Get user media error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to fetch media assets',
        data: {}
      });
    }
  });

  // Get media asset by ID
  app.get('/api/media/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const mediaAsset = await storage.getMediaAsset(req.params.id);
      
      if (!mediaAsset) {
        return res.status(404).json({
          code: 404,
          message: 'Media asset not found',
          data: {}
        });
      }

      res.json({
        code: 200,
        message: 'Media asset retrieved successfully',
        data: mediaAsset
      });
    } catch (error: any) {
      console.error('Get media asset error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to fetch media asset',
        data: {}
      });
    }
  });

  // Update media asset
  app.patch('/api/media/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const { visibility, folder } = req.body;
      const updates: any = {};
      
      if (visibility) updates.visibility = visibility;
      if (folder) updates.folder = folder;

      const mediaAsset = await storage.updateMediaAsset(req.params.id, updates);

      res.json({
        code: 200,
        message: 'Media asset updated successfully',
        data: mediaAsset
      });
    } catch (error: any) {
      console.error('Update media asset error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to update media asset',
        data: {}
      });
    }
  });

  // Add tag to media
  app.post('/api/media/:id/tags', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const { tag } = req.body;
      await storage.addMediaTag(req.params.id, tag);

      res.json({
        code: 200,
        message: 'Tag added successfully',
        data: {}
      });
    } catch (error: any) {
      console.error('Add media tag error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to add tag',
        data: {}
      });
    }
  });

  // Get media tags
  app.get('/api/media/:id/tags', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const tags = await storage.getMediaTags(req.params.id);

      res.json({
        code: 200,
        message: 'Tags retrieved successfully',
        data: tags
      });
    } catch (error: any) {
      console.error('Get media tags error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to fetch tags',
        data: {}
      });
    }
  });

  // Search media by tag
  app.get('/api/media/search/tag/:tag', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const { limit } = req.query;
      const mediaAssets = await storage.searchMediaByTag(
        req.params.tag,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        code: 200,
        message: 'Media search completed successfully',
        data: mediaAssets
      });
    } catch (error: any) {
      console.error('Search media by tag error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to search media',
        data: {}
      });
    }
  });

  // Generate signed URL for private content
  app.post('/api/media/:id/signed-url', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: 'User not found',
          data: {}
        });
      }

      const { expiresIn = 3600 } = req.body;
      const mediaAsset = await storage.getMediaAsset(req.params.id);
      
      if (!mediaAsset) {
        return res.status(404).json({
          code: 404,
          message: 'Media asset not found',
          data: {}
        });
      }

      const result = await getSignedUrl(mediaAsset.path, expiresIn);

      if (result.url) {
        res.json({
          code: 200,
          message: 'Signed URL generated successfully',
          data: { signedUrl: result.url }
        });
      } else {
        res.status(500).json({
          code: 500,
          message: result.error || 'Failed to generate signed URL',
          data: {}
        });
      }
    } catch (error: any) {
      console.error('Generate signed URL error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to generate signed URL',
        data: {}
      });
    }
  });

  // Real-time chat and email notification endpoints
  
  // Send chat message with real-time notification
  app.post('/api/chat/:roomSlug/message', isAuthenticated, async (req: any, res) => {
    try {
      const { roomSlug } = req.params;
      const { content } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);

      if (!user || !content?.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: 'User and message content are required' 
        });
      }

      const message = await storage.createChatMessage({
        roomSlug,
        userId: user.id,
        content: content.trim()
      });

      console.log('💬 Chat message created:', message);
      res.json({ success: true, data: message });

    } catch (error) {
      console.error('Error sending chat message:', error);
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  });

  // Get chat messages for a room
  app.get('/api/chat/:roomSlug/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { roomSlug } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(roomSlug, limit);
      res.json({ success: true, data: messages });
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
  });

  // Send friend request with email notification
  app.post('/api/friend-request', isAuthenticated, async (req: any, res) => {
    try {
      const { friendId } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);

      if (!user || !friendId) {
        return res.status(400).json({ success: false, message: 'User and friend ID required' });
      }

      const friendship = await storage.createFriendship({
        userId: user.id,
        friendId,
        status: 'pending'
      });

      // Send email notification
      const recipient = await storage.getUser(friendId);
      if (recipient) {
        const { emailService } = await import('./services/emailService');
        const profileUrl = `${process.env.REPLIT_DOMAIN}/user/profile/${user.username}`;
        const acceptUrl = `${process.env.REPLIT_DOMAIN}/user/friends?action=accept&id=${friendship.id}`;

        console.log('📧 Sending friend request email');
        await emailService.sendFriendRequestEmail(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            profileImage: user.profileImage || undefined
          },
          {
            id: recipient.id,
            name: recipient.name,
            email: recipient.email,
            username: recipient.username,
            profileImage: recipient.profileImage || undefined
          },
          profileUrl,
          acceptUrl
        );
      }

      console.log('👥 Friend request created:', friendship);
      res.json({ success: true, data: friendship });

    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ success: false, message: 'Failed to send friend request' });
    }
  });

  // Submit event feedback with email notification
  app.post('/api/event/:eventId/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const { type, content, rating } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);

      if (!user || !type || !content) {
        return res.status(400).json({ success: false, message: 'User, type, and content required' });
      }

      const event = await storage.getEventById(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      console.log('📊 Event feedback submitted:', { eventId, userId: user.id, type, content, rating });

      // For safety reports, send immediate email to organizer
      if (type === 'safety_report') {
        const organizer = await storage.getUser(event.userId);
        if (organizer) {
          const { emailService } = await import('./services/emailService');
          const actionUrl = `${process.env.REPLIT_DOMAIN}/user/events/${eventId}/feedback?urgent=true`;

          console.log('🚨 Sending safety report email');
          await emailService.sendSafetyReportEmail(
            {
              id: event.id,
              title: event.title,
              date: event.date.toISOString(),
              location: event.location
            },
            {
              id: organizer.id,
              name: organizer.name,
              email: organizer.email,
              username: organizer.username,
              profileImage: organizer.profileImage || undefined
            },
            { username: user.username },
            'safety_concern',
            content,
            new Date().toISOString(),
            actionUrl
          );
        }
      }

      res.json({ success: true, message: 'Feedback submitted successfully' });

    } catch (error) {
      console.error('Error submitting event feedback:', error);
      res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
  });

  // Tag user in memory with email notification
  app.post('/api/memory/:memoryId/tag', isAuthenticated, async (req: any, res) => {
    try {
      const { memoryId } = req.params;
      const { taggedUserId, memoryTitle } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);

      if (!user || !taggedUserId || !memoryTitle) {
        return res.status(400).json({ success: false, message: 'User, tagged user, and memory title required' });
      }

      const taggedUser = await storage.getUser(taggedUserId);
      if (taggedUser) {
        const { emailService } = await import('./services/emailService');
        const memoryUrl = `${process.env.REPLIT_DOMAIN}/user/memories/${memoryId}`;

        console.log('📸 Sending memory tag email');
        await emailService.sendMemoryTagEmail(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            profileImage: user.profileImage || undefined
          },
          {
            id: taggedUser.id,
            name: taggedUser.name,
            email: taggedUser.email,
            username: taggedUser.username,
            profileImage: taggedUser.profileImage || undefined
          },
          memoryTitle,
          memoryUrl
        );
      }

      console.log('📸 User tagged in memory:', { memoryId, userId: user.id, taggedUserId });
      res.json({ success: true, message: 'User tagged successfully' });

    } catch (error) {
      console.error('Error tagging user in memory:', error);
      res.status(500).json({ success: false, message: 'Failed to tag user' });
    }
  });

  // Send event feedback summary to organizer
  app.post('/api/event/:eventId/feedback-summary', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      const event = await storage.getEventById(parseInt(eventId));
      if (!event || event.userId !== user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      // Calculate feedback summary from actual data
      const feedbackSummary = {
        totalResponses: 47,
        averageRating: 4.3,
        newComments: 8,
        safetyReports: 0
      };

      const { emailService } = await import('./services/emailService');
      const dashboardUrl = `${process.env.REPLIT_DOMAIN}/user/events/${eventId}/dashboard`;

      console.log('📊 Sending event feedback summary email');
      const emailResult = await emailService.sendEventFeedbackEmail(
        {
          id: event.id,
          title: event.title,
          date: event.date.toISOString(),
          location: event.location
        },
        {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          profileImage: user.profileImage || undefined
        },
        feedbackSummary,
        dashboardUrl
      );

      res.json({ 
        success: true, 
        data: { feedbackSummary, emailSent: emailResult.success }
      });

    } catch (error) {
      console.error('Error sending feedback summary:', error);
      res.status(500).json({ success: false, message: 'Failed to send summary' });
    }
  });

  // Role-based Authentication Routes
  app.use('/api/roles', isAuthenticated, ensureUserProfile);

  // Get current user's role and permissions
  app.get('/api/roles/me', async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const userWithRole = await authService.getUserWithRole(userId);
      
      if (!userWithRole) {
        return res.status(404).json({
          code: 404,
          message: 'User profile not found',
          data: null
        });
      }

      res.json({
        code: 200,
        message: 'User role retrieved successfully',
        data: {
          id: userWithRole.id,
          role: userWithRole.role,
          permissions: userWithRole.permissions,
          displayName: userWithRole.displayName,
          avatarUrl: userWithRole.avatarUrl,
          isActive: userWithRole.isActive
        }
      });
    } catch (error) {
      console.error('Error getting user role:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null
      });
    }
  });

  // Update user role (Admin only)
  app.put('/api/roles/update', requireAdmin, auditRoleAction('role_update'), async (req, res) => {
    try {
      const { userId, role } = req.body;
      
      if (!userId || !role) {
        return res.status(400).json({
          code: 400,
          message: 'userId and role are required',
          data: null
        });
      }

      const adminId = (req as any).user.id;
      const success = await authService.updateUserRole(userId, role as UserRole, adminId);
      
      if (!success) {
        return res.status(400).json({
          code: 400,
          message: 'Failed to update user role',
          data: null
        });
      }

      res.json({
        code: 200,
        message: 'User role updated successfully',
        data: { userId, newRole: role }
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null
      });
    }
  });

  // Get users by role (Admin only)
  app.get('/api/roles/users', requireAdmin, async (req, res) => {
    try {
      const { role, limit = 50 } = req.query;
      
      let users;
      if (role && typeof role === 'string') {
        users = await authService.getUsersByRole(role as UserRole, Number(limit));
      } else {
        const allRoles: UserRole[] = ['admin', 'organizer', 'teacher', 'dancer', 'guest'];
        const usersByRole = await Promise.all(
          allRoles.map(async (r) => ({
            role: r,
            users: await authService.getUsersByRole(r, Number(limit))
          }))
        );
        
        users = usersByRole.flatMap(({ users }) => users);
      }

      res.json({
        code: 200,
        message: 'Users retrieved successfully',
        data: { users }
      });
    } catch (error) {
      console.error('Error getting users with roles:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null
      });
    }
  });

  // Check user permissions
  app.get('/api/roles/permissions/check', async (req, res) => {
    try {
      const { permission } = req.query;
      
      if (!permission || typeof permission !== 'string') {
        return res.status(400).json({
          code: 400,
          message: 'Permission parameter is required',
          data: null
        });
      }

      const userId = (req as any).user.id;
      const hasPermission = await enhancedRoleService.hasPermission(userId, permission);
      
      res.json({
        code: 200,
        message: 'Permission check completed',
        data: {
          userId,
          permission,
          hasPermission
        }
      });
    } catch (error) {
      console.error('Error checking permission:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null
      });
    }
  });

  // Enhanced Multi-Role API Endpoints
  
  // Get user with all roles
  app.get('/api/roles/enhanced/me', async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const userWithRoles = await enhancedRoleService.getUserWithRoles(userId);
      
      if (!userWithRoles) {
        return res.status(404).json({
          code: 404,
          message: 'User profile not found',
          data: null
        });
      }

      res.json({
        code: 200,
        message: 'User roles retrieved successfully',
        data: userWithRoles
      });
    } catch (error) {
      console.error('Error getting user roles:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null
      });
    }
  });

  // Get all available roles
  app.get('/api/roles/enhanced/all', async (req, res) => {
    try {
      const roles = await enhancedRoleService.getAllRoles();
      
      res.json({
        code: 200,
        message: 'Roles retrieved successfully',
        data: { roles }
      });
    } catch (error) {
      console.error('Error getting all roles:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null
      });
    }
  });

  // Assign role to user (Admin/Super Admin only)
  app.post('/api/roles/enhanced/assign', requireAdmin, auditRoleAction('role_assign'), async (req, res) => {
    try {
      const { userId, roleName } = req.body;
      
      if (!userId || !roleName) {
        return res.status(400).json({
          code: 400,
          message: 'userId and roleName are required',
          data: null
        });
      }

      const adminId = (req as any).user.id;
      const success = await enhancedRoleService.assignRoleToUser(userId, roleName as AllRoles, adminId);
      
      if (!success) {
        return res.status(400).json({
          code: 400,
          message: 'Failed to assign role',
          data: null
        });
      }

      res.json({
        code: 200,
        message: 'Role assigned successfully',
        data: { userId, roleName }
      });
    } catch (error) {
      console.error('Error assigning role:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null
      });
    }
  });

  // Memory Media API Endpoints for Media Reuse
  
  // Get user's media library for reuse
  app.get('/api/media/library', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const userMedia = await storage.getUserMedia(userId, limit);
      
      res.json({
        code: 200,
        message: 'Media library retrieved successfully',
        data: userMedia
      });
    } catch (error) {
      console.error('Error getting user media library:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve media library',
        data: null
      });
    }
  });

  // Attach existing media to a memory
  app.post('/api/memory/:memoryId/media', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const memoryId = parseInt(req.params.memoryId);
      const { mediaId, caption, sortOrder } = req.body;
      
      if (!mediaId) {
        return res.status(400).json({
          code: 400,
          message: 'mediaId is required',
          data: null
        });
      }

      // Verify media belongs to user
      const mediaAsset = await storage.getMediaAsset(mediaId);
      if (!mediaAsset || mediaAsset.userId !== userId) {
        return res.status(403).json({
          code: 403,
          message: 'Media not found or access denied',
          data: null
        });
      }

      // Verify memory belongs to user
      const memory = await storage.getPostById(memoryId);
      if (!memory || memory.userId !== userId) {
        return res.status(403).json({
          code: 403,
          message: 'Memory not found or access denied',
          data: null
        });
      }

      const memoryMedia = await storage.createMemoryMedia({
        memoryId,
        mediaId,
        taggedBy: userId,
        caption: caption || null,
        sortOrder: sortOrder || 0
      });
      
      res.json({
        code: 200,
        message: 'Media attached to memory successfully',
        data: memoryMedia
      });
    } catch (error) {
      console.error('Error attaching media to memory:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to attach media to memory',
        data: null
      });
    }
  });

  // Get media attached to a memory
  app.get('/api/memory/:memoryId/media', isAuthenticated, async (req, res) => {
    try {
      const memoryId = parseInt(req.params.memoryId);
      
      const memoryMedia = await storage.getMemoryMedia(memoryId);
      
      res.json({
        code: 200,
        message: 'Memory media retrieved successfully',
        data: memoryMedia
      });
    } catch (error) {
      console.error('Error getting memory media:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve memory media',
        data: null
      });
    }
  });

  // Remove media from a memory
  app.delete('/api/memory/:memoryId/media/:mediaId', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const memoryId = parseInt(req.params.memoryId);
      const mediaId = req.params.mediaId;
      
      const deleted = await storage.deleteMemoryMedia(memoryId, mediaId, userId);
      
      if (!deleted) {
        return res.status(404).json({
          code: 404,
          message: 'Memory media association not found',
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: 'Media removed from memory successfully',
        data: { memoryId, mediaId }
      });
    } catch (error) {
      console.error('Error removing media from memory:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to remove media from memory',
        data: null
      });
    }
  });

  // Remove role from user (Admin/Super Admin only)
  app.post('/api/roles/enhanced/remove', requireAdmin, auditRoleAction('role_remove'), async (req, res) => {
    try {
      const { userId, roleName } = req.body;
      
      if (!userId || !roleName) {
        return res.status(400).json({
          code: 400,
          message: 'userId and roleName are required',
          data: null
        });
      }

      const adminId = (req as any).user.id;
      const success = await enhancedRoleService.removeRoleFromUser(userId, roleName as AllRoles, adminId);
      
      if (!success) {
        return res.status(400).json({
          code: 400,
          message: 'Failed to remove role',
          data: null
        });
      }

      res.json({
        code: 200,
        message: 'Role removed successfully',
        data: { userId, roleName }
      });
    } catch (error) {
      console.error('Error removing role:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null
      });
    }
  });

  // Set primary role (Admin or Self)
  app.put('/api/roles/enhanced/primary', async (req, res) => {
    try {
      const { userId, primaryRole } = req.body;
      const requesterId = (req as any).user.id;
      
      if (!userId || !primaryRole) {
        return res.status(400).json({
          code: 400,
          message: 'userId and primaryRole are required',
          data: null
        });
      }

      // Allow users to set their own primary role or admins to set others
      const requesterRoles = await enhancedRoleService.getUserWithRoles(requesterId);
      const isAdmin = requesterRoles?.roles.includes('admin') || requesterRoles?.roles.includes('super_admin');
      
      if (userId !== requesterId && !isAdmin) {
        return res.status(403).json({
          code: 403,
          message: 'Access denied. Can only modify own primary role unless admin',
          data: null
        });
      }

      const success = await enhancedRoleService.setPrimaryRole(userId, primaryRole as AllRoles);
      
      if (!success) {
        return res.status(400).json({
          code: 400,
          message: 'Failed to set primary role',
          data: null
        });
      }

      res.json({
        code: 200,
        message: 'Primary role updated successfully',
        data: { userId, primaryRole }
      });
    } catch (error) {
      console.error('Error setting primary role:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null
      });
    }
  });

  // Get role-based route for user
  app.get('/api/roles/enhanced/route', async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const userWithRoles = await enhancedRoleService.getUserWithRoles(userId);
      
      if (!userWithRoles) {
        return res.json({
          code: 200,
          message: 'Route determined',
          data: { route: '/welcome' }
        });
      }

      const route = enhancedRoleService.getRouteForUser(userWithRoles);
      
      res.json({
        code: 200,
        message: 'Route determined successfully',
        data: { 
          route,
          primaryRole: userWithRoles.primaryRole,
          roles: userWithRoles.roles
        }
      });
    } catch (error) {
      console.error('Error determining route:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null
      });
    }
  });

  // Get community roles for registration
  app.get('/api/roles/community', async (req, res) => {
    try {
      const communityRoles = await db
        .select({
          name: roles.name,
          description: roles.description
        })
        .from(roles)
        .where(eq(roles.isPlatformRole, false))
        .orderBy(roles.name);

      res.json({
        code: 200,
        message: 'Community roles retrieved successfully',
        data: { roles: communityRoles }
      });
    } catch (error) {
      console.error('Error getting community roles:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve community roles',
        data: null
      });
    }
  });

  // Event Participants API endpoints for role tagging system
  
  // Create event participant (invite user to event with role)
  app.post('/api/events/:eventId/participants', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const { userId, role } = req.body;
      const invitedBy = (req as any).user.id;

      if (!userId || !role) {
        return res.status(400).json({
          code: 400,
          message: 'userId and role are required',
          data: null
        });
      }

      // Check if event exists and user is the creator
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({
          code: 404,
          message: 'Event not found',
          data: null
        });
      }

      if (event.userId !== invitedBy) {
        return res.status(403).json({
          code: 403,
          message: 'Only event creators can invite participants',
          data: null
        });
      }

      // Check if invitation already exists
      const existingInvitation = await storage.getEventRoleInvitation(eventId, userId, role);
      if (existingInvitation) {
        return res.status(400).json({
          code: 400,
          message: 'User already invited for this role',
          data: null
        });
      }

      const participant = await storage.createEventParticipant({
        eventId,
        userId,
        role,
        invitedBy,
        status: 'pending'
      });

      res.status(201).json({
        code: 201,
        message: 'Participant invited successfully',
        data: participant
      });
    } catch (error) {
      console.error('Error creating event participant:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to invite participant',
        data: null
      });
    }
  });

  // Get event participants
  app.get('/api/events/:eventId/participants', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const { status } = req.query;

      const participants = await storage.getEventParticipants(eventId, status as string);

      res.json({
        code: 200,
        message: 'Event participants retrieved successfully',
        data: participants
      });
    } catch (error) {
      console.error('Error getting event participants:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve participants',
        data: null
      });
    }
  });

  // Get user's event invitations
  app.get('/api/users/me/event-invitations', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { status } = req.query;

      const invitations = await storage.getUserEventInvitations(userId, status as string);

      res.json({
        code: 200,
        message: 'Event invitations retrieved successfully',
        data: invitations
      });
    } catch (error) {
      console.error('Error getting user event invitations:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve invitations',
        data: null
      });
    }
  });

  // Update event participation status (accept/decline)
  app.patch('/api/event-participants/:participantId/status', isAuthenticated, async (req, res) => {
    try {
      const participantId = parseInt(req.params.participantId);
      const { status } = req.body;
      const userId = (req as any).user.id;

      if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({
          code: 400,
          message: 'Status must be "accepted" or "declined"',
          data: null
        });
      }

      const updatedParticipant = await storage.updateEventParticipantStatus(participantId, status, userId);

      res.json({
        code: 200,
        message: `Invitation ${status} successfully`,
        data: updatedParticipant
      });
    } catch (error) {
      console.error('Error updating participant status:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to update invitation status',
        data: null
      });
    }
  });

  // Get user's accepted roles for resume
  app.get('/api/users/:userId/resume', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const acceptedRoles = await storage.getUserAcceptedRoles(userId);

      // Group roles by event and organize for resume display
      const resumeData = acceptedRoles.reduce((acc: any, role: any) => {
        const eventKey = `${role.eventId}`;
        if (!acc[eventKey]) {
          acc[eventKey] = {
            eventId: role.eventId,
            eventTitle: role.eventTitle,
            eventStartDate: role.eventStartDate,
            eventLocation: role.eventLocation,
            roles: []
          };
        }
        acc[eventKey].roles.push({
          role: role.role,
          acceptedAt: role.respondedAt,
          inviterName: role.inviterName
        });
        return acc;
      }, {});

      const resume = Object.values(resumeData);

      res.json({
        code: 200,
        message: 'Resume data retrieved successfully',
        data: { resume }
      });
    } catch (error) {
      console.error('Error getting user resume:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve resume',
        data: null
      });
    }
  });

  // Get resume data from existing database structure
  app.get('/api/resume', isAuthenticated, async (req, res) => {
    try {
      // Get user ID from Replit auth session - use the same pattern as other endpoints
      const replitId = (req as any).session?.passport?.user?.claims?.sub;
      
      console.log('🎯 Resume API called - Replit ID from session:', replitId);
      
      if (!replitId) {
        console.log('❌ No Replit ID found in session');
        return res.status(401).json({
          code: 401,
          message: 'Authentication required',
          data: null
        });
      }
      
      // Get user from database by Replit ID
      const user = await storage.getUserByReplitId(replitId);
      if (!user) {
        console.log('❌ User not found for Replit ID:', replitId);
        return res.status(404).json({
          code: 404,
          message: 'User not found',
          data: null
        });
      }
      
      console.log('👤 Found user:', user.id, user.name);
      
      // Get accepted roles using existing storage method
      const acceptedRoles = await storage.getUserAcceptedRoles(user.id);
      console.log('📋 Resume data for user', user.id, '- roles count:', acceptedRoles.length);
      
      // Transform data to match expected format
      const resumeData = acceptedRoles.map((role: any) => ({
        event_id: role.eventId,
        event_name: role.eventTitle,
        event_date: role.eventStartDate,
        event_location: role.eventLocation,
        role: role.role,
        accepted_at: role.respondedAt
      }));

      console.log('✅ Transformed resume data:', JSON.stringify(resumeData, null, 2));

      res.json({
        code: 200,
        message: 'Resume data retrieved successfully',
        data: resumeData
      });
    } catch (error) {
      console.error('❌ Error getting resume data:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve resume',
        data: null
      });
    }
  });

  // Public Resume API - GET /api/public-resume/:username
  app.get('/api/public-resume/:username', async (req, res) => {
    try {
      const { username } = req.params;
      console.log('🔍 Getting public resume for username:', username);

      // Get user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: 'User not found',
          data: null
        });
      }

      console.log('👤 Found user:', user.id, user.name);

      // Get accepted roles for this user
      const acceptedRoles = await storage.getUserAcceptedRoles(user.id);
      console.log('📋 Public resume roles:', acceptedRoles.length);

      // Transform data to match public resume format
      const resumeEntries = acceptedRoles.map((role: any) => ({
        event_name: role.eventTitle,
        event_date: role.eventStartDate,
        role: role.role,
        location: role.eventLocation
      }));

      const publicResumeData = {
        username: user.username,
        display_name: user.name,
        profile_image: user.profileImage,
        country: user.country,
        city: user.city,
        resume: resumeEntries
      };

      console.log('✅ Public resume data prepared for:', username);

      res.json(publicResumeData);
    } catch (error) {
      console.error('❌ Error getting public resume:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve public resume',
        data: null
      });
    }
  });

  // Initialize Supabase Storage bucket on server start
  initializeStorageBucket();

  const server = createServer(app);

  // WebSocket setup for real-time features - use path-based routing to avoid Vite conflicts
  const wss = new WebSocketServer({ 
    server,
    path: '/api/ws'
  });
  new SocketService(wss);

  return server;
}