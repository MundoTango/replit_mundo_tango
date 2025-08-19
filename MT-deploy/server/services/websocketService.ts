import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { storage } from '../storage';
import { logger } from '../lib/logger';

export class WebSocketService {
  private io: SocketServer;
  private userSockets: Map<number, string[]> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.VITE_API_URL || "http://localhost:5000",
        credentials: true
      }
    });

    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('New WebSocket connection', socket.id);

      // Handle user authentication
      socket.on('authenticate', async (userId: number) => {
        try {
          // Store user socket mapping
          const userSockets = this.userSockets.get(userId) || [];
          userSockets.push(socket.id);
          this.userSockets.set(userId, userSockets);

          // Join user-specific room
          socket.join(`user-${userId}`);

          // Send pending notifications count
          const notificationCount = await storage.getUnreadNotificationsCount(userId);
          const friendRequestCount = (await storage.getPendingFriendRequests(userId)).length;
          
          socket.emit('counts-update', {
            notifications: notificationCount,
            friendRequests: friendRequestCount
          });

          logger.info({ userId, socketId: socket.id }, 'User authenticated via WebSocket');
        } catch (error) {
          logger.error({ error }, 'WebSocket authentication error');
        }
      });

      // Handle sending messages
      socket.on('send-message', async (data: {
        senderId: number;
        recipientId: number;
        content: string;
      }) => {
        try {
          // TODO: Store message in database
          
          // Send to recipient if online
          this.io.to(`user-${data.recipientId}`).emit('new-message', {
            senderId: data.senderId,
            content: data.content,
            timestamp: new Date()
          });

          // Send notification
          this.sendNotification(data.recipientId, {
            type: 'message',
            title: 'New Message',
            message: data.content.substring(0, 100)
          });

          socket.emit('message-sent', { success: true });
        } catch (error) {
          logger.error({ error }, 'Error sending message');
          socket.emit('message-sent', { success: false, error: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing', (data: { userId: number; recipientId: number; isTyping: boolean }) => {
        this.io.to(`user-${data.recipientId}`).emit('user-typing', {
          userId: data.userId,
          isTyping: data.isTyping
        });
      });

      // Handle friend request updates
      socket.on('friend-request-sent', async (data: { fromUserId: number; toUserId: number }) => {
        try {
          // Notify recipient
          this.sendNotification(data.toUserId, {
            type: 'friend-request',
            title: 'New Friend Request',
            message: 'You have a new friend request'
          });

          // Update counts for recipient
          const friendRequestCount = (await storage.getPendingFriendRequests(data.toUserId)).length;
          this.io.to(`user-${data.toUserId}`).emit('counts-update', {
            friendRequests: friendRequestCount
          });
        } catch (error) {
          logger.error({ error }, 'Error handling friend request notification');
        }
      });

      // Handle friend request response
      socket.on('friend-request-response', async (data: { 
        requestId: number; 
        fromUserId: number; 
        toUserId: number; 
        accepted: boolean 
      }) => {
        try {
          // Notify original sender
          this.sendNotification(data.fromUserId, {
            type: 'friend-response',
            title: data.accepted ? 'Friend Request Accepted' : 'Friend Request Declined',
            message: data.accepted ? 'Your friend request was accepted!' : 'Your friend request was declined.'
          });
        } catch (error) {
          logger.error({ error }, 'Error handling friend request response');
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        // Remove socket from user mapping
        for (const [userId, sockets] of this.userSockets.entries()) {
          const filtered = sockets.filter(id => id !== socket.id);
          if (filtered.length === 0) {
            this.userSockets.delete(userId);
          } else {
            this.userSockets.set(userId, filtered);
          }
        }
        console.log('WebSocket disconnected', socket.id);
      });
    });
  }

  // Send notification to specific user
  public sendNotification(userId: number, notification: {
    type: string;
    title: string;
    message: string;
  }) {
    this.io.to(`user-${userId}`).emit('notification', notification);
  }

  // Send count updates to specific user
  public sendCountUpdate(userId: number, counts: {
    notifications?: number;
    friendRequests?: number;
  }) {
    this.io.to(`user-${userId}`).emit('counts-update', counts);
  }

  // Get online users
  public getOnlineUsers(): number[] {
    return Array.from(this.userSockets.keys());
  }

  // Check if user is online
  public isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId);
  }
}

// Export singleton instance
let websocketService: WebSocketService | null = null;

export function initializeWebSocket(httpServer: HttpServer): WebSocketService {
  if (!websocketService) {
    websocketService = new WebSocketService(httpServer);
  }
  return websocketService;
}

export function getWebSocketService(): WebSocketService | null {
  return websocketService;
}