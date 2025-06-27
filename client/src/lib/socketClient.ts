import { getAuthToken } from './authUtils';

export class SocketClient {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      
      // Authenticate
      const token = getAuthToken();
      if (token) {
        this.send('auth', { token });
      }
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.socket.onclose = () => {
      console.log('Socket disconnected');
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('Socket error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'auth_success':
        console.log('Socket authenticated successfully');
        break;
      case 'new_message':
        this.emit('newMessage', message.data);
        break;
      case 'new_post':
        this.emit('newPost', message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  send(type: string, data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    }
  }

  private emit(event: string, data: any) {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const socketClient = new SocketClient();
