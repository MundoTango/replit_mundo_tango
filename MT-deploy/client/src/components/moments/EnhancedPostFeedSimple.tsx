/**
 * ESA LIFE CEO 61x21 - Enhanced Post Feed with Memory Filters Integration
 * Simplified version that works with the new MemoryFilters component
 */

import React, { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import EnhancedPostItem from './EnhancedPostItem';

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
  comments?: Array<{
    id: number;
    content: string;
    userId: number;
    user: {
      id: number;
      name: string;
      profileImage?: string;
    };
    createdAt: string;
    mentions?: string[];
  }>;
  commentsCount?: number;
  isLiked?: boolean;
  hashtags?: string[];
  location?: string;
  hasConsent?: boolean;
  mentions?: Array<{
    type: 'user' | 'event' | 'group';
    id: string;
    display: string;
  }>;
  emotionTags?: string[];
  reactions?: Record<string, number>;
  userReaction?: string;
  commentCount?: number;
  shareCount?: number;
}

interface EnhancedPostFeedProps {
  className?: string;
  filters?: {
    filterType: 'all' | 'following' | 'nearby';
    tags: string[];
    visibility: 'all' | 'public' | 'friends' | 'private';
    location?: { lat: number; lng: number; radius: number };
  };
}

const EnhancedPostFeed = React.memo(({ filters }: EnhancedPostFeedProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ESA LIFE CEO 61x21 - Fetch posts with filters applied (FIXED: was using /api/memories/feed)
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/posts/feed', filters?.filterType, filters?.tags, filters?.visibility, filters?.location],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Apply filter type
      if (filters?.filterType && filters.filterType !== 'all') {
        params.append('filter', filters.filterType);
      }
      
      // Apply tags
      if (filters?.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      
      // Apply visibility
      if (filters?.visibility && filters.visibility !== 'all') {
        params.append('visibility', filters.visibility);
      }
      
      // Apply location for nearby filter
      if (filters?.location) {
        params.append('lat', filters.location.lat.toString());
        params.append('lng', filters.location.lng.toString());
        params.append('radius', filters.location.radius.toString());
      }
      
      const response = await fetch(`/api/posts/feed?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'  // CRITICAL: Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts feed');
      }
      
      const data = await response.json();
      console.log('📊 Fetched posts with filters:', { filters, count: data.data?.length });
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch posts');
      }
      
      return data.data || [];
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Like functionality
  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: number; isLiked: boolean }) => {
      return apiRequest(isLiked ? `/api/posts/${postId}/unlike` : `/api/posts/${postId}/like`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    },
  });

  const handleLike = useCallback((postId: number, isLiked: boolean) => {
    likeMutation.mutate({ postId, isLiked });
  }, [likeMutation]);

  // Share functionality
  const handleShare = useCallback(async (post: Post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Memory by ${post.user.name}`,
          text: post.content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Copied!",
          description: "Link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [toast]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 animate-pulse border border-gray-200/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-lg w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded-lg w-24"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-3/5"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Posts Feed */}
      <section className="space-y-8">
        {posts && posts.length > 0 ? (
          <>
            {/* Feed Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-turquoise-500 to-blue-500 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-blue-600 bg-clip-text text-transparent">
                    {filters?.filterType === 'all' ? 'All Posts' : 
                     filters?.filterType === 'following' ? 'Following' : 
                     'Nearby Memories'}
                  </h2>
                  <p className="text-gray-600">
                    {posts.length} {posts.length === 1 ? 'memory' : 'memories'} found
                    {filters?.tags && filters.tags.length > 0 && (
                      <span className="ml-2 text-turquoise-600">
                        • Filtered by {filters.tags.length} tag{filters.tags.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
              {posts.map((post: Post) => (
                <EnhancedPostItem
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onShare={handleShare}
                />
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-8">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-turquoise-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-turquoise-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No memories found</h3>
              <p className="text-gray-600 leading-relaxed">
                {filters?.filterType === 'following' 
                  ? "No memories from people you're following yet. Start following dancers to see their memories here!"
                  : filters?.filterType === 'nearby'
                  ? "No nearby memories found. Try expanding your search radius or check back later."
                  : filters?.tags && filters.tags.length > 0
                  ? `No memories found with the tags: ${filters.tags.map(tag => `#${tag}`).join(', ')}`
                  : "Share your first tango moment to start building beautiful memories!"
                }
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
});

EnhancedPostFeed.displayName = 'EnhancedPostFeed';

export default EnhancedPostFeed;