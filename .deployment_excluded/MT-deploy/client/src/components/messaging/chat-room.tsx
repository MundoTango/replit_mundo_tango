import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/authUtils";
import { useAuth } from "@/contexts/auth-context";
import { useSocket } from "@/hooks/useSocket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Phone, 
  Video,
  Paperclip,
  Smile
} from "lucide-react";

interface ChatRoomProps {
  room: {
    id: string;
    slug: string;
    title: string;
    type: 'single' | 'group';
    imageUrl?: string;
  };
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  slug: string;
  userSlug: string;
  messageType: string;
  message: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

export default function ChatRoom({ room, onBack }: ChatRoomProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { sendMessage } = useSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: [`/api/chat/rooms/${room.slug}/messages`],
    queryFn: async () => {
      const response = await fetch(`/api/chat/rooms/${room.slug}/messages`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return data.data.reverse(); // Reverse to show newest at bottom
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; roomSlug: string }) => {
      // Send via WebSocket first
      sendMessage('chat_message', messageData);
      
      // Also store in database via API
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomSlug: messageData.roomSlug,
          messageType: 'TEXT',
          message: messageData.message,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/chat/rooms/${room.slug}/messages`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail;
      if (message.roomSlug === room.slug) {
        queryClient.invalidateQueries({ queryKey: [`/api/chat/rooms/${room.slug}/messages`] });
      }
    };

    window.addEventListener('newChatMessage', handleNewMessage as EventListener);
    return () => {
      window.removeEventListener('newChatMessage', handleNewMessage as EventListener);
    };
  }, [room.slug, queryClient]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessageMutation.mutate({
      message: newMessage,
      roomSlug: room.slug,
    });
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatMessageDate = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const dateKey = formatMessageDate(message.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Card className="card-shadow h-full flex flex-col">
      {/* Header */}
      <CardHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="lg:hidden p-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {room.type === 'group' ? (
              <div className="w-10 h-10 bg-tango-red rounded-full flex items-center justify-center text-white font-semibold">
                {room.title.substring(0, 2).toUpperCase()}
              </div>
            ) : (
              <Avatar className="w-10 h-10">
                <AvatarImage src={room.imageUrl} alt={room.title} />
                <AvatarFallback>{room.title.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            
            <div>
              <h3 className="font-semibold text-tango-black">{room.title}</h3>
              <p className="text-xs text-gray-500">
                {room.type === 'group' ? 'Group chat' : 'Online'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="loading-spinner w-6 h-6"></div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="text-center mb-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {date}
                  </span>
                </div>
                
                {/* Messages for this date */}
                {dateMessages.map((message) => {
                  const isOwnMessage = message.userSlug === user?.id?.toString();
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {!isOwnMessage && (
                          <Avatar className="w-6 h-6 mb-1">
                            <AvatarImage src={message.user?.profileImage} alt={message.user?.name} />
                            <AvatarFallback className="text-xs">
                              {message.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`rounded-lg px-3 py-2 ${
                          isOwnMessage 
                            ? 'bg-tango-red text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {!isOwnMessage && room.type === 'group' && (
                            <p className="text-xs font-medium mb-1 text-tango-red">
                              {message.user?.name}
                            </p>
                          )}
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" type="button" className="text-gray-600">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="pr-10"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              type="button"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-600"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            type="submit"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-tango-red hover:bg-tango-red/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
