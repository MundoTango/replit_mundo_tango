import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Users, MessageCircle, Calendar, Music, Heart, MapPin, Award, Camera } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConnectionDegreeDisplay } from '@/components/friendship/ConnectionDegreeDisplay';
import { FriendshipTimeline } from '@/components/friendship/FriendshipTimeline';
import { FriendshipAnalytics } from '@/components/friendship/FriendshipAnalytics';
import { DanceHistoryForm } from '@/components/friendship/DanceHistoryForm';

export default function FriendshipPage() {
  const { friendId } = useParams<{ friendId: string }>();
  const [showDanceHistoryForm, setShowDanceHistoryForm] = useState(false);

  const { data: friendship, isLoading } = useQuery({
    queryKey: ['/api/friendship/details', friendId],
    queryFn: async () => {
      const response = await fetch(`/api/friendship/details/${friendId}`);
      if (!response.ok) throw new Error('Failed to fetch friendship details');
      return response.json();
    }
  });

  const { data: mutualFriends } = useQuery({
    queryKey: ['/api/friendship/mutual', friendId],
    queryFn: async () => {
      const response = await fetch(`/api/friendship/mutual/${friendId}`);
      if (!response.ok) throw new Error('Failed to fetch mutual friends');
      return response.json();
    }
  });

  const { data: sharedMemories } = useQuery({
    queryKey: ['/api/friendship/shared-memories', friendId],
    queryFn: async () => {
      const response = await fetch(`/api/friendship/shared-memories/${friendId}`);
      if (!response.ok) throw new Error('Failed to fetch shared memories');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!friendship) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center glassmorphic-card">
          <p className="text-gray-600">Friendship not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Hero Section */}
      <Card className="relative overflow-hidden glassmorphic-card">
        <div className="absolute inset-0 bg-gradient-to-r from-turquoise-400/20 to-cyan-500/20" />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                  <AvatarImage src={friendship.user.profileImage} alt={friendship.user.name} />
                  <AvatarFallback>{friendship.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <ConnectionDegreeDisplay degree={friendship.connectionDegree} />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                  {friendship.user.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {friendship.user.city}, {friendship.user.country}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Friends since {new Date(friendship.friendsSince).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDanceHistoryForm(true)}
                className="bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600"
              >
                <Music className="w-4 h-4 mr-2" />
                Add Dance Memory
              </Button>
              <Button variant="outline" className="glassmorphic-button">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-turquoise-600">{friendship.stats.totalDances}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Dances Together</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{friendship.stats.sharedEvents}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Shared Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{friendship.stats.sharedGroups}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Groups in Common</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{mutualFriends?.length || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mutual Friends</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{friendship.stats.closenessScore}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Closeness Score</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Mutual Friends Section */}
      {mutualFriends && mutualFriends.length > 0 && (
        <Card className="p-6 glassmorphic-card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-turquoise-500" />
            Mutual Friends ({mutualFriends.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mutualFriends.slice(0, 6).map((friend: any) => (
              <div key={friend.id} className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-2">
                  <AvatarImage src={friend.profileImage} alt={friend.name} />
                  <AvatarFallback>{friend.name[0]}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium truncate">{friend.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{friend.city}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Shared Memories Gallery */}
      {sharedMemories && sharedMemories.length > 0 && (
        <Card className="p-6 glassmorphic-card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-500" />
            Shared Memories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sharedMemories.slice(0, 8).map((memory: any) => (
              <div key={memory.id} className="relative group">
                <img 
                  src={memory.photoUrl} 
                  alt={memory.description}
                  className="rounded-lg w-full h-40 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm truncate">{memory.description}</p>
                    <p className="text-white/80 text-xs">{new Date(memory.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full glassmorphic-card">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="dance-history" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Dance History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <FriendshipTimeline 
            friendId={parseInt(friendId!)}
            friendName={friendship.user.name}
            friendImage={friendship.user.profileImage}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <FriendshipAnalytics userId={parseInt(friendId!)} />
        </TabsContent>

        <TabsContent value="dance-history">
          <Card className="p-6 glassmorphic-card">
            <h3 className="text-xl font-semibold mb-4">Dance History</h3>
            {/* Dance history list would go here */}
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Dance history visualization coming soon...
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dance History Form Modal */}
      {showDanceHistoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <DanceHistoryForm 
              partnerId={parseInt(friendId!)}
              partnerName={friendship.user.name}
              onComplete={() => setShowDanceHistoryForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}