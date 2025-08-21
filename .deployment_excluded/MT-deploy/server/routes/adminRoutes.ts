import { Router } from 'express';
import { storage } from '../storage';
import { requireAdmin } from '../middleware/roleAuth';
import { db } from '../db';
import { eq, sql, desc, count } from 'drizzle-orm';
import { users, posts, events, groups } from '../../shared/schema';

const router = Router();

// Admin statistics endpoint
router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    // Get total counts
    const [userCount] = await db.select({ count: count() }).from(users);
    const [postCount] = await db.select({ count: count() }).from(posts);
    const [eventCount] = await db.select({ count: count() }).from(events);
    const [groupCount] = await db.select({ count: count() }).from(groups);

    // Get recent activity
    const recentUsers = await db.select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);

    const recentPosts = await db.select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(5);

    res.json({
      stats: {
        totalUsers: userCount.count,
        totalPosts: postCount.count,
        totalEvents: eventCount.count,
        totalGroups: groupCount.count
      },
      recentActivity: {
        users: recentUsers,
        posts: recentPosts
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// User management
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const allUsers = await db.select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: count() }).from(users);

    res.json({
      users: allUsers,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(Number(totalCount.count) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Ban/unban user
router.post('/admin/users/:userId/ban', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { reason, duration } = req.body;

    await storage.banUser(userId, reason, duration);

    res.json({ success: true, message: 'User banned successfully' });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

router.post('/admin/users/:userId/unban', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    await storage.unbanUser(userId);

    res.json({ success: true, message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// Content moderation
router.get('/admin/moderation/pending', requireAdmin, async (req, res) => {
  try {
    const pendingContent = await storage.getPendingModeration();
    res.json(pendingContent);
  } catch (error) {
    console.error('Error fetching pending moderation:', error);
    res.status(500).json({ error: 'Failed to fetch pending content' });
  }
});

router.post('/admin/moderation/:contentId/approve', requireAdmin, async (req, res) => {
  try {
    const contentId = parseInt(req.params.contentId);
    await storage.approveContent(contentId);
    res.json({ success: true, message: 'Content approved' });
  } catch (error) {
    console.error('Error approving content:', error);
    res.status(500).json({ error: 'Failed to approve content' });
  }
});

router.post('/admin/moderation/:contentId/reject', requireAdmin, async (req, res) => {
  try {
    const contentId = parseInt(req.params.contentId);
    const { reason } = req.body;
    await storage.rejectContent(contentId, reason);
    res.json({ success: true, message: 'Content rejected' });
  } catch (error) {
    console.error('Error rejecting content:', error);
    res.status(500).json({ error: 'Failed to reject content' });
  }
});

export default router;