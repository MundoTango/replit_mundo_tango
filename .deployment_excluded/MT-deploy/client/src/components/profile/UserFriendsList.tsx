import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, UserMinus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserFriendsListProps {
  userId: number;
  isOwnProfile: boolean;
}

export function UserFriendsList({ userId, isOwnProfile }: UserFriendsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: friends = [], isLoading, error } = useQuery({
    queryKey: ['/api/user/friends', userId],
    enabled: !!userId,
  });

  const filteredFriends = friends.filter((friend: any) =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="glassmorphic-card">
            <CardContent className="p-4">
              <div className="animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glassmorphic-card">
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load friends</h3>
          <p className="text-gray-600">Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {friends.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {filteredFriends.length > 0 ? (
        <div className="grid gap-4">
          {filteredFriends.map((friend: any) => (
            <Card key={friend.id} className="glassmorphic-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={friend.profileImage} alt={friend.name} />
                      <AvatarFallback className="bg-gradient-to-br from-turquoise-400 to-cyan-500 text-white">
                        {friend.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900">{friend.name || friend.username}</h4>
                      <p className="text-sm text-gray-600">@{friend.username}</p>
                      {friend.city && (
                        <p className="text-xs text-gray-500">{friend.city}, {friend.country}</p>
                      )}
                    </div>
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-red-600"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchQuery ? (
        <Card className="glassmorphic-card">
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No friends found</h3>
            <p className="text-gray-600">Try a different search term.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glassmorphic-card">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No friends yet</h3>
            <p className="text-gray-600">
              {isOwnProfile
                ? 'Start connecting with other tango dancers to build your network.'
                : 'No friends to display.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}