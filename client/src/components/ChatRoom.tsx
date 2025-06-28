import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Users, Circle } from 'lucide-react';
import { realtimeService } from '@/services/realtime';

interface ChatMessage {
  id: number;
  roomSlug: string;
  userId: number;
  content: string;
  createdAt: string;
  user?: {
    name: string;
    username: string;
    profileImage?: string;
  };
}

interface PresenceUser {
  userId: number;
  username: string;
  profileImage?: string;
  isTyping?: boolean;
  lastSeen: string;
}

interface ChatRoomProps {
  roomSlug: string;
  currentUser: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  onSendMessage: (content: string) => Promise<void>;
  className?: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  roomSlug,
  currentUser,
  onSendMessage,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPresent, setIsPresent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize realtime connections
  useEffect(() => {
    console.log('🔄 Initializing chat room:', roomSlug);
    realtimeService.setCurrentUser(currentUser.id);

    // Subscribe to chat messages
    const unsubscribeChat = realtimeService.subscribeToChatRoom(
      roomSlug,
      handleNewMessage,
      () => setIsConnected(false)
    );

    // Join presence channel
    const leavePresence = realtimeService.joinRoomPresence(
      roomSlug,
      {
        userId: currentUser.id,
        username: currentUser.username,
        profileImage: currentUser.profileImage,
        isTyping: false,
        lastSeen: new Date().toISOString()
      },
      handlePresenceUpdate
    );

    setIsConnected(true);
    setIsPresent(true);

    return () => {
      console.log('🧹 Cleaning up chat room connections');
      unsubscribeChat();
      leavePresence();
      setIsConnected(false);
      setIsPresent(false);
    };
  }, [roomSlug, currentUser.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewMessage = (message: ChatMessage) => {
    console.log('💬 New message received:', message);
    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });

    // Track message received
    if (window.plausible) {
      window.plausible('Chat Message Received', {
        props: {
          roomSlug: roomSlug,
          messageLength: message.content.length,
          isOwnMessage: message.userId === currentUser.id ? 'yes' : 'no'
        }
      });
    }
  };

  const handlePresenceUpdate = (users: PresenceUser[]) => {
    console.log('👻 Presence updated:', users);
    setPresenceUsers(users.filter(u => u.userId !== currentUser.id));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
      
      // Track message sent
      if (window.plausible) {
        window.plausible('Chat Message Sent', {
          props: {
            roomSlug: roomSlug,
            messageLength: newMessage.length
          }
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleTyping = (content: string) => {
    setNewMessage(content);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Update typing status
    realtimeService.updateTypingStatus(roomSlug, true);

    // Stop typing after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      realtimeService.updateTypingStatus(roomSlug, false);
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTypingUsers = () => {
    return presenceUsers.filter(user => user.isTyping);
  };

  const getOnlineUsers = () => {
    return presenceUsers.filter(user => {
      const lastSeen = new Date(user.lastSeen);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
      return diffMinutes < 5; // Consider online if active within 5 minutes
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat Room</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
              <Circle className={`w-2 h-2 mr-1 ${isConnected ? 'fill-green-500' : 'fill-red-500'}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {getOnlineUsers().length + 1} online
            </Badge>
          </div>
        </div>
        
        {/* Online Users */}
        {getOnlineUsers().length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-500">Online:</span>
            <div className="flex -space-x-2">
              {getOnlineUsers().slice(0, 5).map(user => (
                <Avatar key={user.userId} className="w-6 h-6 border-2 border-white">
                  <AvatarImage src={user.profileImage} alt={user.username} />
                  <AvatarFallback className="text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {getOnlineUsers().length > 5 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                  +{getOnlineUsers().length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => {
              const isOwnMessage = message.userId === currentUser.id;
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={message.user?.profileImage} alt={message.user?.name} />
                      <AvatarFallback className="text-sm">
                        {(message.user?.name || message.user?.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-first' : ''}`}>
                    {!isOwnMessage && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.user?.name || message.user?.username}</span>
                        <span className="text-xs text-gray-500">{formatMessageTime(message.createdAt)}</span>
                      </div>
                    )}
                    
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {isOwnMessage && (
                        <span className="text-xs text-blue-100 block mt-1">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isOwnMessage && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={currentUser.profileImage} alt={currentUser.name} />
                      <AvatarFallback className="text-sm">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            
            {/* Typing Indicators */}
            {getTypingUsers().length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500 px-2">
                <div className="flex -space-x-1">
                  {getTypingUsers().slice(0, 3).map(user => (
                    <Avatar key={user.userId} className="w-5 h-5 border border-white">
                      <AvatarImage src={user.profileImage} alt={user.username} />
                      <AvatarFallback className="text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="italic">
                  {getTypingUsers().length === 1
                    ? `${getTypingUsers()[0].username} is typing...`
                    : `${getTypingUsers().length} people are typing...`
                  }
                </span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="flex-shrink-0 p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected || isSending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected || isSending}
            size="sm"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;