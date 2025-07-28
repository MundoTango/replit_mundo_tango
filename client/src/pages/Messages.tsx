import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { format } from 'date-fns';
import { Send, MessageCircle, Search, Bell, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  id: string;
  user: {
    id: number;
    name: string;
    profileImage?: string;
    isOnline?: boolean;
  };
  lastMessage?: Message;
  unreadCount: number;
}

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: user } = useQuery<{
    id: number;
    name: string;
    email: string;
    profileImage?: string;
  }>({
    queryKey: ['/api/auth/user']
  });

  // Connect to WebSocket
  useEffect(() => {
    if (!user) return;

    const newSocket = io(window.location.origin, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      // Authenticate with server
      newSocket.emit('authenticate', user.id);
    });

    newSocket.on('new-message', (data) => {
      // Refresh messages for the conversation
      queryClient.invalidateQueries({ queryKey: ['/api/messages', data.senderId] });
      // Show notification
      toast({
        title: 'New Message',
        description: data.content.substring(0, 50) + '...',
      });
    });

    newSocket.on('user-typing', (data) => {
      if (selectedConversation === String(data.userId)) {
        setIsTyping(data.isTyping);
      }
    });

    newSocket.on('counts-update', (data) => {
      // Update counts in UI
      queryClient.setQueryData(['/api/notifications/count'], { count: data.notifications });
      queryClient.setQueryData(['/api/friends/requests/count'], { count: data.friendRequests });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, selectedConversation, queryClient, toast]);

  // Get conversations
  const { data: conversationsData } = useQuery<{ data: Conversation[] }>({
    queryKey: ['/api/messages/conversations'],
    enabled: !!user
  });

  // Get messages for selected conversation
  const { data: messagesData } = useQuery<{ data: Message[] }>({
    queryKey: ['/api/messages', selectedConversation],
    enabled: !!selectedConversation,
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { recipientId: number; content: string }) => {
      const response = await apiRequest('POST', '/api/messages/send', data);
      return response.json();
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  });

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !user || !selectedConversation) return;

    socket.emit('typing', {
      userId: user.id,
      recipientId: Number(selectedConversation),
      isTyping: true
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        userId: user.id,
        recipientId: Number(selectedConversation),
        isTyping: false
      });
    }, 1000);
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      recipientId: Number(selectedConversation),
      content: message
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesData]);

  const conversations = conversationsData?.data || [];
  const messages = messagesData?.data || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Beautiful Ocean-Themed Header */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 rounded-3xl blur-2xl opacity-30" />
        <div className="relative p-8 rounded-3xl bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50 shadow-xl border-2 border-turquoise-200/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-xl animate-float shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Messages
            </h1>
          </div>
          <p className="text-gray-700 ml-[60px] font-medium">Connect and chat with your tango community</p>
        </div>
      </div>

      <Card className="glassmorphic-card h-[600px] overflow-hidden shadow-2xl border-2 border-turquoise-200/50 bg-white/90 backdrop-blur-xl">
        <div className="flex h-full">
          {/* Conversations list */}
          <div className={`w-full md:w-1/3 border-r border-turquoise-200/30 ${selectedConversation ? 'hidden md:block' : ''}`}>
            <div className="p-4 border-b border-turquoise-200/30 bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-turquoise-500 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10 glassmorphic-input border-turquoise-200/50 focus:border-turquoise-400 focus:ring-turquoise-400/30"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100%-73px)]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="p-4 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-2xl inline-block mb-4">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-700 font-medium">No conversations yet</p>
                  <p className="text-sm mt-2 text-gray-600">Start a conversation from a user's profile</p>
                </div>
              ) : (
                conversations.map((conversation: Conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 hover:bg-gradient-to-r hover:from-turquoise-50/50 hover:to-cyan-50/50 cursor-pointer transition-all duration-200 border-b border-turquoise-100/30 ${
                      selectedConversation === conversation.id 
                        ? 'bg-gradient-to-r from-turquoise-50 to-cyan-50 border-l-4 border-l-turquoise-400' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={conversation.user.profileImage} />
                          <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                        </Avatar>
                        {conversation.user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold truncate">{conversation.user.name}</h3>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {format(new Date(conversation.lastMessage.createdAt), 'MMM d')}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Messages view */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-turquoise-50 to-cyan-50">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar>
                    <AvatarImage src={conversations.find(c => c.id === selectedConversation)?.user.profileImage} />
                    <AvatarFallback>
                      {conversations.find(c => c.id === selectedConversation)?.user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">
                      {conversations.find(c => c.id === selectedConversation)?.user.name}
                    </h2>
                    {isTyping && (
                      <p className="text-sm text-gray-600">typing...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          msg.senderId === user?.id
                            ? 'bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderId === user?.id ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex space-x-2"
                >
                  <Input
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 glassmorphic-input"
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}