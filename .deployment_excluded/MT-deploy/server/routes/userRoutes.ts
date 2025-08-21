import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { setUserContext } from '../middleware/tenantMiddleware';
import { setupUpload } from '../middleware/upload';
import { z } from 'zod';
import { getUserId } from '../utils/authHelper';

const router = Router();
const upload = setupUpload();

// Get current user profile
router.get('/user', isAuthenticated, async (req: any, res) => {
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

// Update user profile
router.patch('/user', isAuthenticated, upload.any(), async (req: any, res) => {
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

// User Settings Routes
router.get("/user/settings", setUserContext, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user settings from database
    const settings = await storage.getUserSettings(userId);
    
    // Return default settings if none exist
    if (!settings) {
      return res.json({
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          eventReminders: true,
          newFollowerAlerts: true,
          messageAlerts: true,
          groupInvites: true,
          weeklyDigest: false,
          marketingEmails: false
        },
        privacy: {
          profileVisibility: 'public',
          showLocation: true,
          showEmail: false,
          showPhone: false,
          allowMessagesFrom: 'friends',
          showActivityStatus: true,
          allowTagging: true,
          showInSearch: true
        },
        appearance: {
          theme: 'light',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          fontSize: 'medium',
          reduceMotion: false
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/user/settings", setUserContext, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { notifications, privacy, appearance } = req.body;

    // Validate and save settings
    await storage.updateUserSettings(userId, {
      notifications,
      privacy,
      appearance
    });

    res.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;