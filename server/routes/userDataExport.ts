import { Request, Response } from 'express';
import { storage } from '../storage.js';
import { trackCriticalActivity } from '../middleware/sessionTimeout.js';

export async function exportUserData(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    // Track this as a critical activity
    trackCriticalActivity(req, 'USER_DATA_EXPORT');

    console.log(`[SECURITY] User data export requested by user ${userId}`);

    // Collect all user data
    const userData: any = {
      exportDate: new Date().toISOString(),
      requestedBy: userId,
      data: {}
    };

    // Get user profile
    const user = await storage.getUserById(userId);
    if (user) {
      userData.data.profile = {
        ...user,
        password: '[REDACTED]' // Never export password hashes
      };
    }

    // Get user posts
    try {
      const posts = await storage.getUserPosts(userId, 1000, 0); // Get all posts
      userData.data.posts = posts;
    } catch (e) {
      userData.data.posts = [];
    }

    // Get user memories
    try {
      const memories = await storage.getUserMemories(userId);
      userData.data.memories = memories;
    } catch (e) {
      userData.data.memories = [];
    }

    // Get user events
    try {
      const events = await storage.getUserEvents(userId);
      userData.data.events = events;
    } catch (e) {
      userData.data.events = [];
    }

    // Get user comments
    try {
      const comments = await storage.getUserComments?.(userId);
      userData.data.comments = comments || [];
    } catch (e) {
      userData.data.comments = [];
    }

    // Get user follows/followers
    try {
      const following = await storage.getUserFollowing(userId);
      const followers = await storage.getUserFollowers(userId);
      userData.data.social = {
        following,
        followers
      };
    } catch (e) {
      userData.data.social = { following: [], followers: [] };
    }

    // Get user groups
    try {
      const groups = await storage.getUserGroups(userId);
      userData.data.groups = groups;
    } catch (e) {
      userData.data.groups = [];
    }

    // Get user media assets
    try {
      const photos = await storage.getUserPhotos(userId);
      const videos = await storage.getUserVideos(userId);
      userData.data.media = {
        photos,
        videos
      };
    } catch (e) {
      userData.data.media = { photos: [], videos: [] };
    }

    // Get user preferences and settings
    try {
      const preferences = await storage.getUserPreferences?.(userId);
      userData.data.preferences = preferences || {};
    } catch (e) {
      userData.data.preferences = {};
    }

    // Log export event
    console.log(`[SECURITY] User data export completed for user ${userId}, size: ${JSON.stringify(userData).length} bytes`);

    // Set appropriate headers for download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="mundo-tango-data-export-${userId}-${Date.now()}.json"`);
    
    return res.json(userData);
  } catch (error) {
    console.error('[SECURITY] Error exporting user data:', error);
    return res.status(500).json({
      code: 500,
      message: 'Failed to export user data'
    });
  }
}

// Get user data export status (for rate limiting)
export async function getExportStatus(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    // Check last export time from session or database
    const lastExport = req.session?.lastDataExport || 0;
    const timeSinceLastExport = Date.now() - lastExport;
    const canExport = timeSinceLastExport > 3600000; // 1 hour rate limit

    return res.json({
      canExport,
      lastExport: lastExport ? new Date(lastExport).toISOString() : null,
      nextAvailable: canExport ? null : new Date(lastExport + 3600000).toISOString(),
      message: canExport ? 'You can export your data' : 'Please wait before requesting another export'
    });
  } catch (error) {
    console.error('[SECURITY] Error checking export status:', error);
    return res.status(500).json({
      code: 500,
      message: 'Failed to check export status'
    });
  }
}