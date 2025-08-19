import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  MoreVertical,
  Users,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle,
  ThumbsUp
} from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

import { renderWithMentions } from '@/utils/renderWithMentions';
import { RoleEmojiDisplay } from '@/components/ui/RoleEmojiDisplay';
import { formatUserLocation } from '@/utils/locationUtils';
import { SimpleLikeButton } from '@/components/ui/SimpleLikeButton';
import { SimpleCommentEditor } from '@/components/ui/SimpleCommentEditor';
import { PostActionsMenu } from '@/components/ui/PostActionsMenu';
import { PostEditDialog } from '@/components/ui/PostEditDialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Post {
  id: number; // Using integer as stored in database
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  userId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    fullName?: string; // Full name for hover tooltip
    username: string;
    profileImage?: string;
    tangoRoles?: string[];
    leaderLevel?: number;
    followerLevel?: number;
    city?: string;
    state?: string;
    country?: string;
  };
  likes?: number;
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
  reactions?: { [key: string]: number };
  currentUserReaction?: string;
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
}

interface PostItemProps {
  post: Post;
  onLike: (postId: number) => void;
  onShare: (post: Post) => void;
}

function EnhancedPostItem({ post, onLike, onShare }: PostItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [commentText, setCommentText] = useState('');
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showShareWithCommentModal, setShowShareWithCommentModal] = useState(false);
  const [shareComment, setShareComment] = useState('');
  const [currentUserReaction, setCurrentUserReaction] = useState(post.currentUserReaction);

  const [comments, setComments] = useState(post.comments || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // All posts in memories feed are treated as posts in the API
  const apiBasePath = `/api/posts`;

  // Fetch comments when section is opened
  const { data: fetchedComments } = useQuery({
    queryKey: [`${apiBasePath}/${post.id}/comments`],
    queryFn: async () => {
      const response = await fetch(`${apiBasePath}/${post.id}/comments`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      const result = await response.json();
      return result.data || [];
    },
    enabled: showComments && post.id != null
  });

  // Update comments when fetched
  React.useEffect(() => {
    if (fetchedComments) {
      setComments(fetchedComments);
    }
  }, [fetchedComments]);

  // Calculate age-based opacity for gradual fade effect
  const postAge = useMemo(() => {
    const daysSinceCreated = differenceInDays(new Date(), new Date(post.createdAt));
    if (daysSinceCreated <= 1) return 1; // Full opacity for recent posts
    if (daysSinceCreated <= 7) return 0.95; // Slight fade for week-old posts
    if (daysSinceCreated <= 30) return 0.85; // More fade for month-old posts
    return 0.75; // Most fade for older posts
  }, [post.createdAt]);



  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      'joy': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'love': 'bg-pink-100 text-pink-800 border-pink-200',
      'excitement': 'bg-orange-100 text-orange-800 border-orange-200',
      'nostalgia': 'bg-purple-100 text-purple-800 border-purple-200',
      'gratitude': 'bg-green-100 text-green-800 border-green-200',
      'inspiration': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[emotion.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getMentionIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-3 w-3" />;
      case 'event': return <Calendar className="h-3 w-3" />;
      case 'group': return <Users className="h-3 w-3" />;
      default: return null;
    }
  };

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // API Mutations
  const reactionMutation = useMutation({
    mutationFn: async ({ postId, reaction }: { postId: number; reaction: string }) => {
      const response = await fetch(`${apiBasePath}/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          reaction
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content, mentions }: { postId: number; content: string; mentions: string[] }) => {
      const response = await fetch(`${apiBasePath}/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          content,
          mentions 
        })
      });
      return response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      queryClient.invalidateQueries({ queryKey: [`${apiBasePath}/${post.id}/comments`] });
      
      // Add the actual comment returned from server
      if (response.data) {
        setComments(prev => [...prev, response.data]);
      }
      
      setShowComments(true);
      toast({ title: "Comment posted successfully!" });
    }
  });

  const reportMutation = useMutation({
    mutationFn: async ({ postId, reason, description }: { postId: number; reason: string; description: string }) => {
      const response = await fetch(`${apiBasePath}/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          reason,
          description 
        })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Report submitted",
        description: "Thank you for your report. We'll review it shortly."
      });
      // Report functionality now handled by PostActionsMenu
    }
  });

  const shareToWallMutation = useMutation({
    mutationFn: async ({ postId, comment }: { postId: number; comment?: string }) => {
      const response = await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          comment: comment || ''
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to share post: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Post shared to your timeline!" });
      setShowShareOptions(false);
      // Refresh the feed to show the shared post
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/posts'] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to share post",
        description: error.message || "Please try again"
      });
    }
  });

  // Enhanced handler functions
  const handleReaction = (reactionId: string) => {
    // Facebook-style reactions: like, love, haha, wow, sad, angry
    const facebookReactions: Record<string, string> = {
      'like': '👍',
      'love': '❤️',
      'haha': '😆',
      'wow': '😮',
      'sad': '😢',
      'angry': '😠'
    };
    
    setCurrentUserReaction(reactionId === currentUserReaction ? '' : reactionId);
    reactionMutation.mutate({ postId: post.id, reaction: reactionId });
  };

  const handleComment = (content: string, mentions: string[]) => {
    commentMutation.mutate({ postId: post.id, content, mentions });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(post.content);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: editedContent })
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      toast({
        title: "Post updated",
        description: "Your post has been successfully updated."
      });
      
      setIsEditing(false);
      // Refresh the feed to show updated content
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    } catch (error) {
      console.error('Edit error:', error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(post.content);
  };

  // ESA LIFE CEO 61x21 - Enhanced delete handler
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        // ESA LIFE CEO 61x21 - Use correct endpoint for memories
        const endpoint = `/api/memories/${post.id}`;
        // Deleting post
        
        const response = await fetch(endpoint, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          toast({ 
            title: "Post deleted",
            description: "Your post has been successfully deleted."
          });
          
          // ESA LIFE CEO 61x21 - Invalidate queries instead of page reload
          queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
          queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
          queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
        } else {
          const errorData = await response.text();
          // Delete failed
          throw new Error('Failed to delete post');
        }
      } catch (error) {
        // Delete error occurred
        toast({
          title: "Error",
          description: "Failed to delete post. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleReport = async (reason: string, description: string) => {
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          postId: post.id, 
          reason, 
          description,
          reportedUserId: post.userId,
          reportType: 'post'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      toast({
        title: "Report submitted",
        description: "Thank you for reporting. Our admin team will review this post."
      });
      // Report functionality moved to PostActionsMenu
    } catch (error) {
      console.error('Report submission error:', error);
      toast({
        title: "Error", 
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    // Don't use native share API, use platform share modal
    setShowShareOptions(true);
  };

  const handleShareToWall = (comment?: string) => {
    shareToWallMutation.mutate({ postId: post.id, comment });
  };

  // ESA LIFE CEO 61x21 - Layer 5 (Authorization) Fix
  // Check if current user is the owner of the post (proper ID comparison)
  const isTestPost = post.content?.includes("TEST POST FOR REPORTING");
  const isOwner = isTestPost ? false : (post.userId === user?.id);
  
  // Debug ownership logic
  console.log('🔐 Post ownership check:', {
    postId: post.id,
    postUserId: post.userId,
    currentUserId: user?.id,
    isOwner: isOwner,
    isTestPost: isTestPost
  });

  const consentGlowClass = post.hasConsent 
    ? 'ring-2 ring-emerald-200 shadow-emerald-100/50 shadow-lg' 
    : '';

  return (
    <article 
      className={`
        relative bg-white/95 backdrop-blur-sm rounded-3xl border border-gray-100/50 
        hover:scale-[1.01] hover:shadow-2xl hover:shadow-indigo-100/30
        transition-all duration-300 ease-out
        ${consentGlowClass}
      `}
      style={{ opacity: postAge }}
    >
      {/* Consent indicator glow effect */}
      {post.hasConsent && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-3xl opacity-30 blur-sm animate-pulse"></div>
      )}
      
      <div className="relative p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar with enhanced styling */}
            <div className="relative">
              {post.user?.profileImage ? (
                <img
                  src={post.user.profileImage}
                  alt={post.user.name || 'User'}
                  className="w-14 h-14 object-cover rounded-2xl ring-2 ring-indigo-100 shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {getAvatarFallback(post.user?.name || 'Anonymous')}
                </div>
              )}
              
              {/* Consent status indicator */}
              {post.hasConsent && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info with enhanced typography */}
            <div className="flex-1">
              <div className="flex flex-col gap-1 mb-1">
                <h3 
                  className="font-bold text-xl text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors"
                  title={post.user?.fullName || post.user?.name || 'Anonymous'}
                >
                  {post.user?.name || 'Anonymous'}
                </h3>
                <div className="text-gray-500 text-sm">
                  {formatUserLocation({ 
                    city: post.user?.city, 
                    state: post.user?.state, 
                    country: post.user?.country 
                  })}
                </div>
              </div>
              
              {/* Enhanced Emoji Role Display */}
              <RoleEmojiDisplay
                tangoRoles={post.user?.tangoRoles}
                leaderLevel={post.user?.leaderLevel}
                followerLevel={post.user?.followerLevel}
                size="sm"
                maxRoles={5}
                className="mt-1"
              />
            </div>
          </div>

          {/* Enhanced timestamp and actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <time className="text-sm font-medium">
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </time>
            </div>
            
            {/* ESA LIFE CEO 61x21 - Post Actions Menu with Edit/Delete */}
            <PostActionsMenu
              post={post}
              onEdit={() => setShowEditDialog(true)}
              onShare={onShare}
            />
          </div>
        </header>

        {/* Emotions and Location Section */}
        {(post.emotionTags?.length || post.location) && (
          <section className="flex items-center justify-between py-4 px-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100/50">
            {/* Emotion tags */}
            {post.emotionTags && post.emotionTags.length > 0 && (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <div className="flex gap-2 flex-wrap">
                  {post.emotionTags.map((emotion, index) => (
                    <span
                      key={index}
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium border
                        ${getEmotionColor(emotion)}
                        hover:scale-105 transition-transform duration-200
                      `}
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {post.location && (
              <div className="flex items-center gap-2 text-indigo-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">{post.location}</span>
              </div>
            )}
          </section>
        )}

        {/* Mentions Section */}
        {post.mentions && post.mentions.length > 0 && (
          <section className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl p-4 border border-purple-100/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">Mentioned</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {post.mentions.map((mention, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white/80 border border-purple-200 rounded-full text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  {getMentionIcon(mention.type)}
                  @{mention.display}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Content Section */}
        <section className="prose prose-lg max-w-none">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-4 border-2 border-indigo-200 rounded-xl focus:border-indigo-400 focus:outline-none resize-none text-gray-800 text-lg"
                rows={5}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-800 leading-relaxed text-lg">
              {renderWithMentions ? renderWithMentions(post.content) : post.content}
            </div>
          )}

          {/* ESA LIFE CEO 61x21 - FIXED media display with ALL fields */}
          {(() => {
            // ESA LIFE CEO 61x21 - Check ALL possible media fields
            const mediaEmbeds = (post as any).mediaEmbeds || [];
            const mediaUrls = (post as any).mediaUrls || [];
            const hasDirectMedia = post.imageUrl || post.videoUrl;
            const hasMediaEmbeds = mediaEmbeds.length > 0;
            const hasMediaUrls = mediaUrls.length > 0;
            
            // Debug media processing
            // Processing post media
            
            if (!hasDirectMedia && !hasMediaUrls && !hasMediaEmbeds) return null;
            
            // Collect all media to display
            const allMedia: Array<{url: string, type: 'image' | 'video'}> = [];
            const processedUrls = new Set<string>();
            
            // Helper function to detect video files
            const isVideoFile = (url: string): boolean => {
              if (!url) return false;
              const lower = url.toLowerCase();
              return lower.includes('.mp4') || lower.includes('.mov') || 
                     lower.includes('.webm') || lower.includes('.avi') ||
                     lower.includes('.m4v') || lower.includes('.mkv');
            };
            
            // Helper to add media without duplicates
            const addMedia = (url: string) => {
              if (!url || processedUrls.has(url)) return;
              processedUrls.add(url);
              const type = isVideoFile(url) ? 'video' : 'image';
              allMedia.push({ url, type });
              // Media added to display list
            };
            
            // Priority 1: Process mediaEmbeds (MOST IMPORTANT for new uploads)
            if (hasMediaEmbeds) {
              mediaEmbeds.forEach((url: string) => addMedia(url));
            }
            
            // Priority 2: Process mediaUrls
            if (hasMediaUrls) {
              mediaUrls.forEach((url: string) => addMedia(url));
            }
            
            // Priority 3: Process direct imageUrl (might be a video)
            if (post.imageUrl) {
              addMedia(post.imageUrl);
            }
            
            // Priority 4: Process videoUrl
            if (post.videoUrl) {
              addMedia(post.videoUrl);
            }
            
            if (allMedia.length === 0) return null;
            
            // Render media grid
            return (
              <div className={`mt-6 ${allMedia.length > 1 ? 'grid grid-cols-2 gap-3' : ''}`}>
                {allMedia.slice(0, 4).map((media, index) => (
                  <div key={`${post.id}-media-${index}`} className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200 bg-black">
                    {media.type === 'video' ? (
                      <div className="relative w-full">
                        {/* ESA LIFE CEO 61x21 - Loading indicator */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none" id={`loading-${post.id}-${index}`}>
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                        </div>
                        <video
                          src={media.url.startsWith('http') ? media.url : `${window.location.origin}${media.url}`}
                          controls
                          className="w-full h-auto relative z-10"
                          preload="auto"
                          playsInline
                          muted
                          style={{ display: 'block', width: '100%', height: 'auto' }}
                          onError={(e) => {
                            // Video loading error
                            e.currentTarget.style.display = 'none';
                            // Hide loading indicator on error
                            const loader = document.getElementById(`loading-${post.id}-${index}`);
                            if (loader) loader.style.display = 'none';
                          }}
                          onLoadedData={(e) => {
                            // Video data loaded
                            // Hide loading indicator when data is loaded
                            const loader = document.getElementById(`loading-${post.id}-${index}`);
                            if (loader) loader.style.display = 'none';
                          }}
                          onLoadedMetadata={() => {
                            // Video metadata loaded
                          }}
                          onCanPlay={() => {
                            // Video ready to play
                            // Ensure loading indicator is hidden
                            const loader = document.getElementById(`loading-${post.id}-${index}`);
                            if (loader) loader.style.display = 'none';
                          }}
                          onProgress={(e) => {
                            const video = e.currentTarget as HTMLVideoElement;
                            const buffered = video.buffered;
                            if (buffered.length > 0) {
                              const bufferedEnd = buffered.end(buffered.length - 1);
                              const duration = video.duration;
                              if (duration > 0) {
                                const percent = (bufferedEnd / duration) * 100;
                                // Buffering progress
                              }
                            }
                          }}
                          onWaiting={() => {
                            // Video buffering
                            // Show loading indicator when buffering
                            const loader = document.getElementById(`loading-${post.id}-${index}`);
                            if (loader) loader.style.display = 'flex';
                          }}
                          onPlaying={() => {
                            // Video playing
                            // Hide loading indicator when playing
                            const loader = document.getElementById(`loading-${post.id}-${index}`);
                            if (loader) loader.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Image load error
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          // Image loaded successfully
                        }}
                      />
                    )}
                  </div>
                ))}
                {allMedia.length > 4 && (
                  <div className="rounded-2xl bg-gray-100 flex items-center justify-center p-4">
                    <span className="text-gray-600 font-medium">+{allMedia.length - 4} more</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {post.hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  #
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Enhanced Action Bar */}
        <footer className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {/* Simple Like System */}
            <SimpleLikeButton
              postId={post.id}
              currentReaction={currentUserReaction}
              reactions={post.reactions}
              onReact={handleReaction}
            />

            {/* Comment button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{comments.length || 0}</span>
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Post Actions Menu is already shown in header - no need to duplicate here */}
          </div>
        </footer>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-6 space-y-4">
            {/* Comment Editor */}
            <SimpleCommentEditor
              postId={post.id}
              onSubmit={(content) => handleComment(content, [])}
              placeholder="Write a thoughtful comment..."
            />

            {/* Existing Comments */}
            {comments && comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {getAvatarFallback(comment.user.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.user.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: comment.content }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal removed due to type conflicts */}

        {/* Report functionality now handled by PostActionsMenu */}

        {/* Share Options Dialog */}
        {showShareOptions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-96 max-w-[90vw] shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Share Post</h3>
              
              <div className="space-y-3">
                {/* Share to Timeline */}
                <button
                  onClick={() => handleShareToWall()}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Share2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Share to Timeline</p>
                    <p className="text-sm text-gray-600">Share this post on your timeline</p>
                  </div>
                </button>

                {/* Share with Comment */}
                <button
                  onClick={() => {
                    setShowShareOptions(false);
                    setShowShareWithCommentModal(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-green-100 rounded-full">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Share with Comment</p>
                    <p className="text-sm text-gray-600">Add your thoughts when sharing</p>
                  </div>
                </button>

                {/* Copy Link */}
                <button
                  onClick={async () => {
                    try {
                      const shareUrl = `/posts/${post.id}`;
                      const fullUrl = `${window.location.origin}${shareUrl}`;
                      
                      // Try modern clipboard API first
                      if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(fullUrl);
                      } else {
                        // Fallback for older browsers
                        const textArea = document.createElement("textarea");
                        textArea.value = fullUrl;
                        textArea.style.position = "fixed";
                        textArea.style.left = "-999999px";
                        textArea.style.top = "-999999px";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        document.execCommand('copy');
                        textArea.remove();
                      }
                      
                      toast({ title: "Link copied to clipboard!" });
                      setShowShareOptions(false);
                    } catch (error) {
                      toast({ 
                        title: "Failed to copy link",
                        description: "Please try again" 
                      });
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Share2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Copy Link</p>
                    <p className="text-sm text-gray-600">Copy post link to clipboard</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowShareOptions(false)}
                className="mt-4 w-full p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Share with Comment Modal */}
        {showShareWithCommentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-96 max-w-[90vw] shadow-2xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Share with Comment
              </h3>
              
              {/* Original Post Preview */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {getAvatarFallback(post.user?.name || 'Anonymous')}
                  </div>
                  <span className="font-medium text-sm">{post.user?.name}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {post.content}
                </p>
              </div>

              {/* Comment Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add your thoughts (optional):
                </label>
                <textarea
                  value={shareComment}
                  onChange={(e) => setShareComment(e.target.value)}
                  placeholder="What do you think about this?"
                  className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowShareWithCommentModal(false);
                    setShareComment('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleShareToWall(shareComment);
                    setShowShareWithCommentModal(false);
                    setShareComment('');
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-colors"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <PostEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        post={post}
      />
    </article>
  );
}

export default React.memo(EnhancedPostItem);