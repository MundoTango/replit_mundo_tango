import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  MoreVertical,
  Send
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { supabase } from '@/services/supabaseClient';

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

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

interface PostDetailModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onLike: (postId: number) => void;
  onShare: (post: Post) => void;
}

export default function PostDetailModal({ 
  post, 
  isOpen, 
  onClose, 
  onLike, 
  onShare 
}: PostDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  // Fetch post comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['/api/posts', post.id, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        credentials: 'include'
      });
      const result = await response.json();
      return result.data || [];
    },
    enabled: isOpen
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', `/api/posts/${post.id}/comments`, { content });
    },
    onSuccess: () => {
      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', post.id, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Real-time comment subscription using Supabase (with fallback to polling)
  useEffect(() => {
    if (!isOpen || !post.id) return;

    if (supabase) {
      // Use Supabase Realtime if available
      const channelName = `post-comments-${post.id}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'post_comments',
            filter: `post_id=eq.${post.id}`
          },
          async (payload) => {
            console.log('🔄 Real-time comment added:', payload);
            
            try {
              const response = await fetch(`/api/posts/${post.id}/comments`, {
                credentials: 'include'
              });
              const result = await response.json();
              
              if (result.success) {
                queryClient.setQueryData(['/api/posts', post.id, 'comments'], result.data);
                queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
              }
            } catch (error) {
              console.error('Error fetching updated comments:', error);
            }
          }
        )
        .subscribe((status) => {
          console.log(`📡 Comment subscription status for post ${post.id}:`, status);
        });

      return () => {
        console.log(`🔌 Unsubscribing from comments for post ${post.id}`);
        supabase.removeChannel(channel);
      };
    } else {
      // Fallback to polling when Supabase is not configured
      console.log(`⚠️ Using polling fallback for post ${post.id} comments`);
      
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/posts/${post.id}/comments`, {
            credentials: 'include'
          });
          const result = await response.json();
          
          if (result.success) {
            queryClient.setQueryData(['/api/posts', post.id, 'comments'], result.data);
          }
        } catch (error) {
          console.error('Error polling comments:', error);
        }
      }, 5000);

      return () => {
        console.log(`🔌 Stopping comment polling for post ${post.id}`);
        clearInterval(pollInterval);
      };
    }
  }, [isOpen, post.id, queryClient]);

  // Handle ESC key press and modal cleanup
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'dancer': 'bg-pink-100 text-pink-700',
      'dj': 'bg-purple-100 text-purple-700',
      'teacher': 'bg-blue-100 text-blue-700',
      'organizer': 'bg-green-100 text-green-700',
      'performer': 'bg-yellow-100 text-yellow-700',
      'musician': 'bg-indigo-100 text-indigo-700'
    };
    return colors[role.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Author Avatar */}
            {post.user.profileImage ? (
              <img
                src={post.user.profileImage}
                alt={post.user.name}
                className="w-10 h-10 object-cover rounded-full ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getAvatarFallback(post.user.name)}
              </div>
            )}
            
            <div>
              <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>@{post.user.username}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                {post.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-blue-600">
                      <MapPin className="h-3 w-3" />
                      <span>{post.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Media Section */}
          {(post.imageUrl || post.videoUrl) && (
            <div className="lg:flex-1 bg-black flex items-center justify-center">
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post media"
                  className="max-w-full max-h-full object-contain"
                />
              )}
              {post.videoUrl && (
                <video
                  src={post.videoUrl}
                  className="max-w-full max-h-full object-contain"
                  controls
                  autoPlay
                />
              )}
            </div>
          )}

          {/* Content & Comments Section */}
          <div className="lg:w-96 flex flex-col">
            {/* Post Content */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-gray-900 text-base leading-relaxed mb-3">
                {post.content}
              </p>

              {/* Role Badges */}
              {post.user.tangoRoles && post.user.tangoRoles.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.user.tangoRoles.slice(0, 3).map((role, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.hashtags.map((hashtag, index) => (
                    <span key={index} className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm">
                      #{hashtag}
                    </span>
                  ))}
                </div>
              )}

              {/* Interaction Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onLike(post.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                >
                  <Heart 
                    className={`h-5 w-5 transition-all duration-200 ${
                      post.isLiked 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-500 group-hover:text-red-500'
                    }`}
                  />
                  <span className={`text-sm font-medium ${
                    post.isLiked ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {post.likes || 0}
                  </span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                  <MessageCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-500 text-sm font-medium">
                    {comments.length}
                  </span>
                </button>

                <button
                  onClick={() => onShare(post)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <Share2 className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-500 text-sm font-medium">Share</span>
                </button>
              </div>
            </div>

            {/* Comments Thread */}
            <div className="flex-1 overflow-y-auto">
              {commentsLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {comments.map((comment: Comment) => (
                    <div key={comment.id} className="flex gap-3">
                      {comment.user.profileImage ? (
                        <img
                          src={comment.user.profileImage}
                          alt={comment.user.name}
                          className="w-8 h-8 object-cover rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {getAvatarFallback(comment.user.name)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">
                              {comment.user.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-gray-100">
              <form onSubmit={handleSubmitComment} className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {user ? getAvatarFallback(user.name) : 'U'}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={commentMutation.isPending}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || commentMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}