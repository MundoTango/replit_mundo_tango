import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { setUserContext } from '../middleware/tenantMiddleware';

const router = Router();

// Get memories feed
router.get('/memories/feed', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};
    
    const memories = await storage.getMemoriesFeed(user.id, {
      page,
      limit,
      filters
    });
    
    res.json(memories);
  } catch (error) {
    console.error('Error fetching memories feed:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Create memory
router.post('/memories', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const { content, type, tags, privacy, mediaUrls } = req.body;
    
    const memory = await storage.createMemory({
      userId: user.id,
      content,
      type,
      tags,
      privacy,
      mediaUrls
    });
    
    res.json(memory);
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// Get memory stats
router.get('/memories/stats', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const stats = await storage.getMemoryStats(user.id);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching memory stats:', error);
    res.status(500).json({ error: 'Failed to fetch memory stats' });
  }
});

// Get memory suggestions
router.get('/memories/suggestions', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const suggestions = await storage.getMemorySuggestions(user.id);
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching memory suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Update memory
router.patch('/memories/:memoryId', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const memoryId = parseInt(req.params.memoryId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const memory = await storage.updateMemory(memoryId, user.id, req.body);
    
    res.json(memory);
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// Delete memory
router.delete('/memories/:memoryId', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const memoryId = parseInt(req.params.memoryId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    await storage.deleteMemory(memoryId, user.id);
    
    res.json({ success: true, message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

export default router;