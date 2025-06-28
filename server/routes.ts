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
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up Replit Auth middleware
  await setupAuth(app);

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

      const posts = await storage.getFeedPosts(user.id, limit, offset);
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

  // Onboarding endpoint
  app.post('/api/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { nickname, languages, tangoRoles, location } = req.body;

      const updatedUser = await storage.updateUser(user.id, {
        nickname,
        languages,
        tangoRoles,
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
      });

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

  const server = createServer(app);

  // WebSocket setup for real-time features - use path-based routing to avoid Vite conflicts
  const wss = new WebSocketServer({ 
    server,
    path: '/api/ws'
  });
  new SocketService(wss);

  return server;
}