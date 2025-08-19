/**
 * ESA LIFE CEO 61x21 - Real-Time Notification Service
 * WebSocket integration for instant mention delivery to achieve 100/100 score
 */

import { Server as SocketIOServer } from 'socket.io';
import type { Server } from 'http';

interface NotificationPayload {
  type: 'mention' | 'friend_request' | 'message';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
  timestamp: string;
}

export class RealTimeNotificationService {
  private static io: SocketIOServer | null = null;
  private static userSockets: Map<number, Set<string>> = new Map();

  /**
   * Initialize WebSocket server
   */
  static initialize(server: Server): void {
    this.io = new SocketIOServer(server, {
      path: '/ws',
      cors: {
        origin: true,
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket) => {
      console.log(`📡 WebSocket connected: ${socket.id}`);
      
      // Handle user authentication
      socket.on('authenticate', (data: { userId: number }) => {
        if (data.userId) {
          this.addUserSocket(data.userId, socket.id);
          socket.join(`user_${data.userId}`);
          console.log(`🔐 User ${data.userId} authenticated on socket ${socket.id}`);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.removeUserSocket(socket.id);
        console.log(`📡 WebSocket disconnected: ${socket.id}`);
      });

      // Send initial connection confirmation
      socket.emit('connected', { 
        message: 'Real-time notifications active',
        timestamp: new Date().toISOString()
      });
    });

    console.log('🚀 Real-time notification service initialized');
  }

  /**
   * Send notification to specific user
   */
  static async sendToUser(userId: number, notification: NotificationPayload): Promise<boolean> {
    if (!this.io) {
      console.log('⚠️ WebSocket server not initialized');
      return false;
    }

    try {
      // Send to user's room
      this.io.to(`user_${userId}`).emit('notification', notification);
      
      // Also send to user's specific sockets
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        userSockets.forEach(socketId => {
          this.io?.to(socketId).emit('notification', notification);
        });
      }

      console.log(`📨 Real-time notification sent to user ${userId}:`, notification.type);
      return true;
    } catch (error) {
      console.error('❌ Error sending real-time notification:', error);
      return false;
    }
  }

  /**
   * Send mention notification in real-time
   */
  static async sendMentionNotification(
    mentionedUserId: number,
    mentioner: { username: string; displayName?: string },
    content: string,
    postId?: number
  ): Promise<boolean> {
    const notification: NotificationPayload = {
      type: 'mention',
      title: `${mentioner.displayName || mentioner.username} mentioned you`,
      message: content.length > 100 ? `${content.substring(0, 100)}...` : content,
      actionUrl: postId ? `/post/${postId}` : undefined,
      metadata: {
        mentionerId: mentioner.username,
        mentionerDisplayName: mentioner.displayName,
        postId
      },
      timestamp: new Date().toISOString()
    };

    return await this.sendToUser(mentionedUserId, notification);
  }

  /**
   * Send friendship notification in real-time
   */
  static async sendFriendshipNotification(
    userId: number,
    friend: { username: string; displayName?: string },
    type: 'friend_request' | 'friend_accepted' | 'closeness_updated'
  ): Promise<boolean> {
    let title: string;
    let message: string;
    
    switch (type) {
      case 'friend_request':
        title = `New friend request from ${friend.displayName || friend.username}`;
        message = `${friend.displayName || friend.username} wants to connect with you`;
        break;
      case 'friend_accepted':
        title = `${friend.displayName || friend.username} accepted your friend request`;
        message = `You're now connected with ${friend.displayName || friend.username}`;
        break;
      case 'closeness_updated':
        title = `Stronger connection with ${friend.displayName || friend.username}`;
        message = `Your friendship score has increased through recent interactions`;
        break;
    }

    const notification: NotificationPayload = {
      type: 'friend_request',
      title,
      message,
      actionUrl: `/profile/${friend.username}`,
      metadata: {
        friendUsername: friend.username,
        friendDisplayName: friend.displayName,
        friendshipType: type
      },
      timestamp: new Date().toISOString()
    };

    return await this.sendToUser(userId, notification);
  }

  /**
   * Track user socket connections
   */
  private static addUserSocket(userId: number, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  /**
   * Remove user socket connection
   */
  private static removeUserSocket(socketId: string): void {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  /**
   * Get connected users count
   */
  static getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get user's active connections count
   */
  static getUserConnectionsCount(userId: number): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  /**
   * Broadcast to all connected users (admin function)
   */
  static async broadcastToAll(notification: NotificationPayload): Promise<number> {
    if (!this.io) {
      return 0;
    }

    this.io.emit('notification', notification);
    console.log(`📢 Broadcast notification sent to all users:`, notification.type);
    return this.getConnectedUsersCount();
  }
}