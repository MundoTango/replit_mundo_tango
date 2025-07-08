import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Search, X, Tag, Filter, Sparkles, Users, Globe, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import FacebookInspiredMemoryCard from './FacebookInspiredMemoryCard';

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
  hasConsent?: boolean;
  mentions?: Array<{
    type: 'user' | 'event' | 'group';
    id: string;
    display: string;
  }>;
  emotionTags?: string[];
}

export default function EnhancedPostFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterBy, setFilterBy] = useState<'all' | 'following' | 'nearby'>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');


  // Fetch posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/posts/feed', filterBy, filterTags],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterBy !== 'all') params.append('filter', filterBy);
      if (filterTags.length > 0) {
        filterTags.forEach(tag => params.append('tags', tag));
      }
      
      const response = await fetch(`/api/posts/feed?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const result = await response.json();
      return result.data || [];
    }
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (postId: number) => apiRequest('POST', `/api/posts/${postId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive"
      });
    }
  });

  const handleLike = (postId: number) => {
    likeMutation.mutate(postId);
  };

  const handleShare = (post: Post) => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.user.name}`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${post.content}\n\n- ${post.user.name} (@${post.user.username})`);
      toast({
        title: "Copied!",
        description: "Post content copied to clipboard"
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !filterTags.includes(tagInput.trim())) {
      setFilterTags([...filterTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFilterTags(filterTags.filter(t => t !== tag));
  };

  const getFilterIcon = (filter: string) => {
    switch (filter) {
      case 'all': return <Globe className="h-4 w-4" />;
      case 'following': return <Users className="h-4 w-4" />;
      case 'nearby': return <MapPin className="h-4 w-4" />;
      default: return <Filter className="h-4 w-4" />;
    }
  };

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case 'all': return 'All Memories';
      case 'following': return 'Following';
      case 'nearby': return 'Nearby';
      default: return filter;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/60 rounded-3xl p-8 animate-pulse">
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
      {/* Enhanced Filter Section */}
      <section className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-3xl p-6 border border-indigo-100/50 shadow-lg">
        {/* Filter Type Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-indigo-700">
            <Filter className="h-5 w-5" />
            <span className="font-semibold">Filter Memories</span>
          </div>
          <div className="h-px bg-indigo-200 flex-1"></div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {['all', 'following', 'nearby'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterBy(filter as any)}
              className={`
                flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all duration-300
                ${filterBy === filter
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200/50 scale-105'
                  : 'bg-white/70 text-indigo-700 hover:bg-white/90 hover:scale-105 border border-indigo-200/50'
                }
              `}
            >
              {getFilterIcon(filter)}
              <span className="capitalize">{getFilterLabel(filter)}</span>
            </button>
          ))}
        </div>

        {/* Enhanced Tag Filter */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-indigo-700">
              <Tag className="h-4 w-4" />
              <span className="font-medium">Filter by Tags</span>
            </div>
          </div>

          {/* Tag Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag to filter memories..."
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-indigo-200/50 rounded-2xl text-gray-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={addTag}
              disabled={!tagInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-medium hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
            >
              Add
            </button>
          </div>

          {/* Active Tags */}
          {filterTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-indigo-700">Active filters:</span>
              {filterTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 border border-indigo-200 rounded-full text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="p-0.5 hover:bg-indigo-200 rounded-full transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Posts Feed */}
      <section className="space-y-8">

        {posts && posts.length > 0 ? (
          <>
            {/* Feed Header with View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filterBy === 'all' ? 'All Memories' : 
                     filterBy === 'following' ? 'Following' : 
                     'Nearby Memories'}
                  </h2>
                  <p className="text-gray-600">
                    {posts.length} {posts.length === 1 ? 'memory' : 'memories'} found
                  </p>
                </div>
              </div>

            </div>

            {/* Posts List */}
            <div className="space-y-2">
              {posts.map((post: Post) => (
                <FacebookInspiredMemoryCard
                  key={post.id}
                  post={post}
                  onLike={() => handleLike(post.id)}
                  onComment={() => {}}
                  onShare={() => handleShare(post.id)}
                />
              ))}
            </div>
          </>
        ) : (
          /* Enhanced Empty State */
          <div className="text-center py-16 px-8">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-12 w-12 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No memories found</h3>
              <p className="text-gray-600 mb-8">
                {filterTags.length > 0 
                  ? 'Try removing some filters or create a new memory with these tags.'
                  : 'Be the first to share a tango memory! Your moments help build our community.'
                }
              </p>
              {filterTags.length > 0 && (
                <button
                  onClick={() => setFilterTags([])}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}