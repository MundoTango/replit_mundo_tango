import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  MoreVertical,
  Bookmark
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import RoleBadge from '@/components/RoleBadge';

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  userId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
    tangoRoles?: string[];
  };
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  hashtags?: string[];
  location?: string;
}

export default function PostFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'following' | 'nearby'>('all');

  // Fetch posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/posts/feed', filterBy, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterBy !== 'all') params.append('filter', filterBy);
      if (searchQuery) params.append('q', searchQuery);
      
      const response = await fetch(`/api/posts/feed?${params}`, {
        credentials: 'include'
      });
      const result = await response.json();
      return result.data || [];
    }
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('POST', `/api/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    }
  });

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleSharePost = (post: Post) => {
    if (navigator.share) {
      navigator.share({
        title: `${post.user.name}'s tango moment`,
        text: post.content,
        url: window.location.origin + `/posts/${post.id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/posts/${post.id}`);
      toast({
        title: "Link copied",
        description: "Post link has been copied to clipboard.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No moments yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Be the first to share a tango moment! Share your dance journey, milestones, and experiences with the community.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
        <Button
          variant={filterBy === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilterBy('all')}
          className={filterBy === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
        >
          All Moments
        </Button>
        <Button
          variant={filterBy === 'following' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilterBy('following')}
          className={filterBy === 'following' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
        >
          Following
        </Button>
        <Button
          variant={filterBy === 'nearby' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilterBy('nearby')}
          className={filterBy === 'nearby' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
        >
          Nearby
        </Button>
      </div>

      {/* Posts Feed */}
      {posts.map((post: Post) => (
        <Card key={post.id} className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.user.profileImage} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                    {post.user.name?.[0] || post.user.username?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                    {post.user.tangoRoles?.slice(0, 2).map(role => (
                      <RoleBadge key={role} role={role} size="sm" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>@{post.user.username}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="space-y-4">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              
              {/* Media */}
              {post.imageUrl && (
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={post.imageUrl} 
                    alt="Post content"
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}
              
              {post.videoUrl && (
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  <video 
                    src={post.videoUrl} 
                    controls
                    className="w-full max-h-96"
                  />
                </div>
              )}
              
              {/* Location & Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {post.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    <MapPin className="h-3 w-3" />
                    <span>{post.location}</span>
                  </div>
                )}
                
                {post.hashtags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-pink-100 text-pink-700 hover:bg-pink-200">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikePost(post.id)}
                  className={`hover:bg-red-50 ${post.isLiked ? 'text-red-500' : 'text-gray-600'}`}
                >
                  <Heart className={`mr-2 h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  {post.likes || 0}
                </Button>
                
                <Button variant="ghost" size="sm" className="hover:bg-blue-50 text-gray-600">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {post.comments || 0}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSharePost(post)}
                  className="hover:bg-green-50 text-gray-600"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" className="hover:bg-yellow-50 text-gray-600">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}