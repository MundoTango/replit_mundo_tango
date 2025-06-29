import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import PostItem from './PostItem';

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
  const [filterBy, setFilterBy] = useState<'all' | 'following' | 'nearby'>('all');

  // Fetch posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/posts/feed', filterBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterBy !== 'all') params.append('filter', filterBy);
      
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
          <div key={i} className="card animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="h-48 bg-gray-200 rounded-xl mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-pink-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No moments yet</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Be the first to share a tango moment! Share your dance journey, milestones, and experiences with the community.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs - TT Style */}
      <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
        {(['all', 'following', 'nearby'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterBy(filter)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              filterBy === filter
                ? 'bg-[#8E142E] text-white'
                : 'text-gray-600 hover:text-[#8E142E] hover:bg-gray-50'
            }`}
          >
            {filter === 'all' ? 'All Moments' : filter === 'following' ? 'Following' : 'Nearby'}
          </button>
        ))}
      </div>

      {/* Enhanced Posts Feed */}
      {posts.map((post: Post) => (
        <PostItem
          key={post.id}
          post={post}
          onLike={handleLikePost}
          onShare={handleSharePost}
        />
      ))}
    </div>
  );
}