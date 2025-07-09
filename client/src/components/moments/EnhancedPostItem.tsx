import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  MoreVertical,
  Expand,
  Users,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle,
  ThumbsUp
} from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import PostDetailModal from './PostDetailModal';
import { renderWithMentions } from '@/utils/renderWithMentions';
import { RoleEmojiDisplay } from '@/components/ui/RoleEmojiDisplay';
import { formatUserLocation } from '@/utils/locationUtils';
import { FacebookReactionSelector } from '@/components/ui/FacebookReactionSelector';
import { RichTextCommentEditor } from '@/components/ui/RichTextCommentEditor';
import { PostContextMenu } from '@/components/ui/PostContextMenu';
import { ReportModal } from '@/components/ui/ReportModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Post {
  id: string; // Changed from number to string
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
  onLike: (postId: string) => void;
  onShare: (post: Post) => void;
}

export default function EnhancedPostItem({ post, onLike, onShare }: PostItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [commentText, setCommentText] = useState('');
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [currentUserReaction, setCurrentUserReaction] = useState(post.currentUserReaction);
  const [comments, setComments] = useState(post.comments || []);

  // Determine if this is a memory or regular post
  const isMemory = post.id && typeof post.id === 'string' && post.id.startsWith('mem_');
  const apiBasePath = isMemory ? `/api/memories` : `/api/posts`;

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
    mutationFn: async ({ postId, reaction }: { postId: string; reaction: string }) => {
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
    mutationFn: async ({ postId, content, mentions }: { postId: string; content: string; mentions: string[] }) => {
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
    mutationFn: async ({ postId, reason, description }: { postId: string; reason: string; description: string }) => {
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
      setIsReportModalOpen(false);
    }
  });

  const shareToWallMutation = useMutation({
    mutationFn: async ({ postId, comment }: { postId: string; comment?: string }) => {
      const response = await fetch(`${apiBasePath}/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          comment: comment || ''
        })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Post shared to your timeline!" });
      setShowShareOptions(false);
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
    // TODO: Implement edit modal
    toast({ 
      title: "Edit feature coming soon",
      description: "This feature is being implemented."
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      // TODO: Implement delete mutation
      toast({ 
        title: "Delete feature coming soon",
        description: "This feature is being implemented."
      });
    }
  };

  const handleReport = (reason: string, description: string) => {
    reportMutation.mutate({ postId: post.id, reason, description });
  };

  const handleShare = () => {
    // Don't use native share API, use platform share modal
    setShowShareOptions(true);
  };

  const handleShareToWall = (comment?: string) => {
    shareToWallMutation.mutate({ postId: post.id, comment });
  };

  const isOwner = post.userId === user?.id;

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
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>
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
          <div className="text-gray-800 leading-relaxed text-lg">
            {renderWithMentions ? renderWithMentions(post.content) : post.content}
          </div>

          {/* Media content */}
          {post.imageUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200">
              <img
                src={post.imageUrl}
                alt="Post content"
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {post.videoUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200">
              <video
                src={post.videoUrl}
                controls
                className="w-full h-auto"
              />
            </div>
          )}

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
            {/* Facebook-style Reaction System */}
            <FacebookReactionSelector
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
            {/* Context Menu */}
            <PostContextMenu
              postId={post.id}
              isOwner={isOwner}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReport={() => setIsReportModalOpen(true)}
              onShare={handleShare}
            />

            {/* Expand button */}
            <button
              onClick={() => {
                // Open post in new window
                const postUrl = isMemory ? `/memories/${post.id}` : `/posts/${post.id}`;
                window.open(postUrl, '_blank', 'width=800,height=900,menubar=no,toolbar=no,location=no,status=no');
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="Open in new window"
            >
              <Expand className="h-5 w-5" />
            </button>
          </div>
        </footer>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-6 space-y-4">
            {/* Comment Editor */}
            <RichTextCommentEditor
              postId={post.id}
              onSubmit={handleComment}
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

        {/* Modal */}
        {showModal && (
          <PostDetailModal
            post={post}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onLike={onLike}
            onShare={onShare}
          />
        )}

        {/* Report Modal */}
        <ReportModal
          isOpen={isReportModalOpen}
          postId={post.id}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleReport}
        />

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
                    const comment = prompt("Add a comment to your share (optional):");
                    if (comment !== null) {
                      handleShareToWall(comment);
                    }
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
                  onClick={() => {
                    const shareUrl = isMemory ? `/memories/${post.id}` : `/posts/${post.id}`;
                    navigator.clipboard.writeText(`${window.location.origin}${shareUrl}`);
                    toast({ title: "Link copied to clipboard!" });
                    setShowShareOptions(false);
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
      </div>
    </article>
  );
}