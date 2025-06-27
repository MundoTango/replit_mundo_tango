import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/authUtils";
import { useSocket } from "@/hooks/useSocket";
import Navbar from "@/components/layout/navbar";
import MobileNav from "@/components/layout/mobile-nav";
import ChatRoom from "@/components/messaging/chat-room";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, MessageCircle } from "lucide-react";

interface ChatRoomType {
  id: string;
  slug: string;
  title: string;
  type: 'single' | 'group';
  imageUrl?: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount: number;
  participants?: any[];
}

export default function Messages() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { sendMessage } = useSocket();

  // Fetch chat rooms
  const { data: chatRooms = [], isLoading } = useQuery({
    queryKey: ['/api/chat/rooms'],
    queryFn: async () => {
      const response = await fetch('/api/chat/rooms', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch chat rooms');
      const data = await response.json();
      return data.data;
    },
  });

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail;
      // Update chat rooms list or current conversation
      console.log('New message received:', message);
    };

    window.addEventListener('newChatMessage', handleNewMessage as EventListener);
    return () => {
      window.removeEventListener('newChatMessage', handleNewMessage as EventListener);
    };
  }, []);

  const filteredRooms = chatRooms.filter((room: ChatRoomType) =>
    room.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-tango-gray">
      <Navbar onOpenChat={() => {}} />
      
      <div className="pt-16 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            
            {/* Chat List */}
            <div className={`lg:col-span-1 ${selectedRoom ? 'hidden lg:block' : 'block'}`}>
              <Card className="card-shadow h-full">
                <CardContent className="p-0 h-full flex flex-col">
                  
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-tango-black">Messages</h2>
                      <Button size="sm" className="bg-tango-red hover:bg-tango-red/90">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Chat Rooms List */}
                  <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                      <div className="space-y-1">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="p-4 animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredRooms.length > 0 ? (
                      filteredRooms.map((room: ChatRoomType) => (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`p-4 border-b border-gray-100 hover:bg-tango-gray cursor-pointer transition-colors ${
                            selectedRoom?.id === room.id ? 'bg-tango-gray' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {room.type === 'group' ? (
                              <div className="w-12 h-12 bg-tango-red rounded-full flex items-center justify-center text-white font-semibold">
                                {room.title.substring(0, 2).toUpperCase()}
                              </div>
                            ) : (
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={room.imageUrl} alt={room.title} />
                                <AvatarFallback>{room.title.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm text-tango-black truncate">
                                  {room.title}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  {room.lastMessageTimestamp && (
                                    <span className="text-xs text-gray-400">
                                      {new Date(room.lastMessageTimestamp).toLocaleTimeString('en', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </span>
                                  )}
                                  {room.unreadCount > 0 && (
                                    <span className="bg-tango-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                      {room.unreadCount > 9 ? '9+' : room.unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {room.lastMessage && (
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {room.lastMessage}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="text-gray-400 mb-4">
                          <MessageCircle className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          {searchQuery ? 'No conversations found' : 'No messages yet'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {searchQuery 
                            ? 'Try adjusting your search terms'
                            : 'Start a conversation with other tango dancers!'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Window */}
            <div className={`lg:col-span-2 ${selectedRoom ? 'block' : 'hidden lg:block'}`}>
              {selectedRoom ? (
                <ChatRoom 
                  room={selectedRoom} 
                  onBack={() => setSelectedRoom(null)}
                />
              ) : (
                <Card className="card-shadow h-full">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        <MessageCircle className="h-24 w-24 mx-auto" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-gray-500">
                        Choose a conversation from the sidebar to start chatting
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav onOpenChat={() => {}} />
    </div>
  );
}
