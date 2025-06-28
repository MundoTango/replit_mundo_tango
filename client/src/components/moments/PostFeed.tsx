import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

      {/* Posts Feed - Exact TT PostCard Layout */}
      {posts.map((post: Post, index: number) => (
        <div key={post.id} className="card select-none animate-fade-up" id="scrolling">
          <div className="pr-5">
            {/* Exact TT Post Header */}
            <div className="flex justify-between">
              <div className="text-black flex items-center gap-4">
                <img
                  src={post.user.profileImage || '/images/user-placeholder.jpeg'}
                  alt=""
                  loading="lazy"
                  className="w-10 h-10 object-cover rounded-full"
                />
                <div>
                  <div className="text-sm font-semibold">
                    {post.user.name}
                  </div>
                  <div className="text-xs text-gray-text-color">
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                  </div>
                </div>
                <div>
                  {post.user.tangoRoles?.slice(0, 2).map((role) => (
                    <span
                      key={role}
                      className="tags text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 cursor-pointer">
                <div className="text-btn-color text-sm font-bold">
                  See Friendship
                </div>
                <div>
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Exact TT Post Content */}
            <div>
              <div className="text-gray-text-color text-base font-semibold py-5">
                {post.content}
              </div>

              {/* Exact TT Media Layout */}
              {(post.imageUrl || post.videoUrl) && (
                <div className="flex flex-col md:flex-row items-center gap-3 flex-wrap lg:gap-0">
                  {post.imageUrl && (
                    <div className="cursor-pointer">
                      <img
                        className="object-cover w-72 md:w-[15rem] h-[180px] mb-3 pr-2 rounded-xl"
                        loading="lazy"
                        src={post.imageUrl}
                        alt="Post media"
                      />
                    </div>
                  )}
                  {post.videoUrl && (
                    <div>
                      <video
                        className="object-cover w-72 md:w-[15.5rem] h-[180px] mb-3 pr-2 rounded-xl"
                        controls
                      >
                        <source src={post.videoUrl} />
                      </video>
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr />
            <br />

            {/* Exact TT Post Actions */}
            <div className="flex items-center justify-around md:justify-between text-light-gray-color flex-wrap md:gap-0">
              <div
                className="flex items-center gap-2 cursor-pointer w-[100px] justify-start sm:justify-center"
                onClick={() => handleLikePost(post.id)}
              >
                <div>
                  <Heart 
                    className={`h-5 w-5 ${post.isLiked ? 'fill-[#EB2560] text-[#EB2560]' : 'text-[#94A3B8]'}`}
                  />
                </div>
                <div className={`${post.isLiked ? 'text-heart-color' : ''} flex gap-1`}>
                  {post.likes || 0}{" "}
                  <span className="hidden md:block">Likes</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 cursor-pointer w-[100px] justify-center sm:justify-start">
                <div>
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  {post.comments || 0}{" "}
                  <span className="hidden md:block">Comments</span>
                </div>
              </div>
              
              <div
                className="flex items-center gap-2 cursor-pointer w-[100px] justify-end sm:justify-start"
                onClick={() => handleSharePost(post)}
              >
                <div>
                  <Share2 className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  0{" "}
                  <span className="hidden md:block">Shares</span>
                </div>
              </div>
            </div>

            <br />
            <hr />

            {/* TT Comment Input */}
            <div className="my-5 pr-3 input-text flex items-center gap-3 relative">
              <input
                placeholder="Write your comment here"
                className="input-text border-none shadow-none w-full rounded-lg p-3 pl-5 text-base outline-none"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}