import { Router, Request, Response } from 'express';
import { db } from '../db';
import { chatMessages, chatRooms, users } from '../../shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { getUserId } from '../utils/authHelper';

const router = Router();

// Get user's chat rooms
router.get('/api/messages', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    
    // Get all chat rooms for the user
    const rooms = await db
      .select()
      .from(chatRooms)
      .orderBy(desc(chatRooms.updatedAt));
    
    res.json(rooms || []);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get messages in a specific chat room
router.get('/api/messages/:roomSlug', async (req: Request, res: Response) => {
  try {
    const { roomSlug } = req.params;
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatRoomSlug, roomSlug))
      .orderBy(desc(chatMessages.createdAt))
      .limit(50);
    
    res.json(messages || []);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Send a message
router.post('/api/messages', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    const { roomSlug, message, messageType = 'text' } = req.body;
    
    const newMessage = await db
      .insert(chatMessages)
      .values({
        slug: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chatRoomSlug: roomSlug,
        userSlug: `user_${userId}`,
        messageType,
        message,
        isForwarded: false,
        isReply: false
      })
      .returning();
    
    res.json(newMessage[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;