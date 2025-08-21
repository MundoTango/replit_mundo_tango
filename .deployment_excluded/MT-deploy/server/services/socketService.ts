import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

const JWT_SECRET = process.env.JWT_SECRET || "mundo-tango-secret-key";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  username?: string;
}

interface SocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export class SocketService {
  private wss: WebSocketServer;
  private clients: Map<number, AuthenticatedWebSocket> = new Map();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
      console.log('New WebSocket connection');

      // Handle authentication
      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'auth') {
            await this.authenticateSocket(ws, data.token);
          } else if (data.type === 'chat_message') {
            await this.handleChatMessage(ws, data);
          } else if (data.type === 'join_room') {
            await this.handleJoinRoom(ws, data.roomSlug);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        if (ws.userId) {
          this.clients.delete(ws.userId);
          console.log(`User ${ws.userId} disconnected`);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private async authenticateSocket(ws: AuthenticatedWebSocket, token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await storage.getUser(decoded.userId);

      if (!user) {
        ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
        ws.close();
        return;
      }

      ws.userId = user.id;
      ws.username = user.username;
      this.clients.set(user.id, ws);

      ws.send(JSON.stringify({ 
        type: 'auth_success', 
        message: 'Authentication successful',
        user: { id: user.id, username: user.username, name: user.name }
      }));

      console.log(`User ${user.username} authenticated`);
    } catch (error) {
      ws.send(JSON.stringify({ type: 'auth_error', message: 'Authentication failed' }));
      ws.close();
    }
  }

  private async handleChatMessage(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
      return;
    }

    try {
      const message = await storage.createChatMessage({
        chatRoomSlug: data.roomSlug,
        userSlug: ws.userId.toString(),
        messageType: 'TEXT',
        message: data.message,
      });

      // Broadcast message to all users in the chat room
      this.broadcastToRoom(data.roomSlug, 'new_message', {
        ...message,
        username: ws.username,
      });
    } catch (error) {
      console.error('Chat message error:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to send message' }));
    }
  }

  private async handleJoinRoom(ws: AuthenticatedWebSocket, roomSlug: string) {
    if (!ws.userId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
      return;
    }

    // Add user to room (implement room management as needed)
    ws.send(JSON.stringify({ 
      type: 'room_joined', 
      roomSlug,
      message: `Joined room ${roomSlug}` 
    }));
  }

  public broadcastToFollowers(userId: number, type: string, data: any) {
    // Get followers and broadcast to them
    storage.getFollowers(userId).then(followers => {
      followers.forEach(follower => {
        const client = this.clients.get(follower.id);
        if (client && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type,
            data,
            timestamp: Date.now(),
          }));
        }
      });
    });
  }

  public broadcastToRoom(roomSlug: string, type: string, data: any) {
    // Broadcast to all clients in a specific room
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type,
          data,
          roomSlug,
          timestamp: Date.now(),
        }));
      }
    });
  }

  public sendToUser(userId: number, type: string, data: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type,
        data,
        timestamp: Date.now(),
      }));
    }
  }
}
