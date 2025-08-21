import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/authUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Search, Plus, MessageCircle } from "lucide-react";

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatRoom {
  id: string;
  slug: string;
  title: string;
  type: 'single' | 'group';
  imageUrl?: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount: number;
}

export default function ChatOverlay({ isOpen, onClose }: ChatOverlayProps) {
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
    enabled: isOpen,
  });

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-tango-red text-white p-4 flex items-center justify-between">
          <h3 className="font-semibold">Messages</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-white hover:text-gray-200 hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-1">
              {[...Array(6)].map((_, i) => (
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
          ) : chatRooms.length > 0 ? (
            chatRooms.map((room: ChatRoom) => (
              <div
                key={room.id}
                className="p-4 border-b border-gray-100 hover:bg-tango-gray cursor-pointer transition-colors"
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
                            {formatTimeAgo(room.lastMessageTimestamp)}
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
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No messages yet</h3>
              <p className="text-gray-500 text-sm">
                Start a conversation with other tango dancers!
              </p>
            </div>
          )}
        </div>

        {/* New Message Button */}
        <div className="p-4 border-t border-gray-100">
          <Button className="w-full bg-tango-red hover:bg-tango-red/90">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>
    </div>
  );
}
