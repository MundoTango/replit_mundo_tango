import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../auth/useAuthContext';
import ModernMemoriesHeader from '@/components/modern/ModernMemoriesHeader';
import ModernPostComposer from '@/components/modern/ModernPostComposer';
import ModernPostCard from '@/components/modern/ModernPostCard';
import ModernTagFilter from '@/components/modern/ModernTagFilter';
import ModernLoadingState from '@/components/modern/ModernLoadingState';
import { apiRequest } from '@/lib/queryClient';
import toast from 'react-hot-toast';

interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hashtags?: string[] | null;
  isPublic?: boolean | null;
  createdAt: string;
  updatedAt?: string | null;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
}

export default function ModernMemoriesPage() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [showComposer, setShowComposer] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Fetch posts with tag filtering
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/posts/feed', { filterTags: activeTags }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTags.length > 0) {
        params.append('filterTags', activeTags.join(','));
      }
      const response = await fetch(`/api/posts/feed?${params.toString()}`);
      const result = await response.json();
      return result.data || [];
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageFile }: { content: string; imageFile?: File }) => {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('isPublic', 'true');
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      toast.success('Memory shared successfully!', {
        style: {
          background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
          color: 'white',
          borderRadius: '16px',
          padding: '16px',
        },
      });
      setShowComposer(false);
    },
    onError: () => {
      toast.error('Failed to share memory', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '16px',
          padding: '16px',
        },
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest(`/api/posts/${postId}/like`, 'POST');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
  });

  const handleCreatePost = (content: string, mediaFile?: File) => {
    createPostMutation.mutate({ content, imageFile: mediaFile });
  };

  const handleLike = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleAddTag = (tag: string) => {
    setActiveTags(prev => [...prev, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setActiveTags(prev => prev.filter(t => t !== tag));
  };

  const handleComment = (postId: number) => {
    // Implement comment functionality
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: number) => {
    // Implement share functionality
    console.log('Share post:', postId);
  };

  const handleBookmark = (postId: number) => {
    // Implement bookmark functionality
    console.log('Bookmark post:', postId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <ModernLoadingState message="Loading your memories..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <ModernMemoriesHeader onCreatePost={() => setShowComposer(true)} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Post Composer Modal */}
        {showComposer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
              <ModernPostComposer 
                onSubmit={handleCreatePost}
                onClose={() => setShowComposer(false)}
              />
            </div>
          </div>
        )}

        {/* Tag Filter */}
        <ModernTagFilter
          activeTags={activeTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />

        {/* Posts Feed */}
        <div className="space-y-8">
          {isLoading ? (
            <ModernLoadingState type="posts" />
          ) : posts && posts.length > 0 ? (
            posts.map((post: Post) => (
              <ModernPostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onBookmark={handleBookmark}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-12">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-3xl 
                                flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    No memories found
                  </h3>
                  <p className="text-blue-500 mb-6">
                    {activeTags.length > 0 
                      ? 'No memories match your current filters. Try adjusting your search.'
                      : 'Start sharing your tango journey with the community!'
                    }
                  </p>
                  <button
                    onClick={() => setShowComposer(true)}
                    className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 
                             text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl 
                             transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Share Your First Memory
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}