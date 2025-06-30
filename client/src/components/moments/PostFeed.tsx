import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Search, X, Tag } from 'lucide-react';
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
      const result = await response.json();
      return result.data || [];
    }
  });

  // Tag filtering functions
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !filterTags.includes(trimmedTag)) {
      setFilterTags([...filterTags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFilterTags(filterTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

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
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-100/50 p-8 animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-200 to-teal-200 rounded-2xl"></div>
              <div className="space-y-3">
                <div className="h-5 bg-gradient-to-r from-blue-200 to-teal-200 rounded-xl w-32"></div>
                <div className="h-4 bg-gradient-to-r from-coral-200 to-pink-200 rounded-xl w-24"></div>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="h-5 bg-gradient-to-r from-blue-200 to-teal-200 rounded-xl"></div>
              <div className="h-5 bg-gradient-to-r from-blue-200 to-teal-200 rounded-xl w-3/4"></div>
            </div>
            <div className="h-64 bg-gradient-to-br from-coral-100 to-pink-100 rounded-3xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-100/50 p-16 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-coral-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <Heart className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
          No moments yet
        </h3>
        <p className="text-blue-600/80 max-w-lg mx-auto text-lg font-medium leading-relaxed">
          Be the first to share a tango moment! Share your dance journey, milestones, and experiences with the community.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Tag Filter Section */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-100/50 p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-teal-400 to-cyan-500 p-3 rounded-2xl shadow-xl">
            <Tag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Filter by Media Tags
            </h3>
            <p className="text-blue-600/70 font-medium">Discover memories by content type</p>
          </div>
        </div>
        
        {/* Modern Tag Input */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Enter tag name and press Enter..."
              className="w-full pl-12 pr-4 py-4 bg-gradient-to-br from-blue-50/50 to-teal-50/50 border-2 border-blue-200/50 
                       rounded-2xl focus:outline-none focus:border-coral-300 text-blue-900 placeholder-blue-400/80 
                       font-medium text-lg transition-all duration-300"
            />
          </div>
          <button
            onClick={() => addTag(tagInput)}
            disabled={!tagInput.trim()}
            className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 
                     disabled:from-gray-300 disabled:to-gray-400 px-8 py-4 rounded-2xl text-lg font-bold 
                     text-white shadow-xl hover:shadow-teal-500/30 transform hover:-translate-y-1 
                     transition-all duration-300 disabled:transform-none disabled:hover:shadow-none"
          >
            Add
          </button>
        </div>

        {/* Modern Active Filter Tags */}
        {filterTags.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {filterTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-coral-100 to-pink-100 
                         text-coral-700 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transform 
                         hover:scale-105 transition-all duration-200"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:bg-coral-200 rounded-xl p-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Modern Filter Tabs */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-blue-100/50 p-3 mb-8">
        <div className="flex items-center gap-3">
          {(['all', 'following', 'nearby'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterBy(filter)}
              className={`px-8 py-4 text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                filterBy === filter
                  ? 'bg-gradient-to-r from-coral-400 to-pink-500 text-white shadow-2xl shadow-coral-500/30'
                  : 'text-blue-600 hover:bg-blue-50 hover:text-coral-600 bg-blue-50/30'
              }`}
            >
              {filter === 'all' ? 'All Moments' : filter === 'following' ? 'Following' : 'Nearby'}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Posts Feed with improved spacing */}
      <div className="space-y-8 lg:space-y-10">
        {posts.map((post: Post) => (
          <div key={post.id} className="transform transition-all duration-300 hover:scale-[1.01]">
            <PostItem
              post={post}
              onLike={handleLikePost}
              onShare={handleSharePost}
            />
          </div>
        ))}
      </div>
    </div>
  );
}