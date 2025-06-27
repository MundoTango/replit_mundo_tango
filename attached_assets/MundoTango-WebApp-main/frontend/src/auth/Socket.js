import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_API_DOMAIN || `https://api.mundotango.life/?${api_token}`;

class SocketIo {
  constructor() {
    this.socket = null;
  }

  connectToSocket = (api_token, callback = () => {}, success = () => {}) => {
    this.socket = io(`https://api.mundotango.life/?authorization="Bearer ${api_token}"`, {
      transports: ["websocket"],
      autoConnect: false, 
    });

    this.socket.connect();

    this.socket.on("connect", () => {
      console.log(`Socket Connected: ${this.socket.id}`);
      success(this.socket);
    });

    this.socket.on("connect_error", (err) => {
      console.log("Socket connection error:", JSON.stringify(err));
      callback(err);
    });
  };

  emit = (eventName, params = {}, onSuccess) => {
    if (this.socket) {
      this.socket.emit(eventName, params, (res) => {
        if (onSuccess) {
          onSuccess(res.data);
        }
      });
    } else {
      console.error("Socket not connected. Cannot emit event.");
    }
  };

  on = (eventName, callback) => {
    if (this.socket) {
      this.socket.on(eventName, callback);
    } else {
      console.error("Socket not connected. Cannot listen for events.");
    }
  };

  dispose = (eventName) => {
    if (this.socket) {
      this.socket.off(eventName);
    }
  };

  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      console.log("Socket disconnected.");
    }
  };

  getStatus = () => {
    return this.socket ? this.socket.connected : false;
  };
}

export default new SocketIo();