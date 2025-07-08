import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Smile, ThumbsUp, BookmarkIcon, Eye, Calendar, Music, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ReportModal } from '@/components/ui/ReportModal';

interface MemoryCardProps {
  post: any;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function FacebookInspiredMemoryCard({ post, onLike, onComment, onShare }: MemoryCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showReactions, setShowReactions] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(post.currentUserReaction || null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState(post.comments || []);

  const reactions = ['👍', '❤️', '😊', '😢', '😡', '😮'];
  
  // API Mutations
  const reactionMutation = useMutation({
    mutationFn: async ({ postId, reaction }: { postId: string; reaction: string }) => {
      const response = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reaction })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      const newComment = {
        id: Date.now(),
        content: data.comment || data.content || comment,
        user: {
          id: user?.id || 0,
          name: user?.name || 'Anonymous',
          profileImage: user?.profileImage
        },
        createdAt: new Date().toISOString()
      };
      setComments(prev => [...prev, newComment]);
      setComment('');
      toast({ title: "Comment posted successfully!" });
    }
  });

  const reportMutation = useMutation({
    mutationFn: async ({ postId, reason, description }: { postId: string; reason: string; description: string }) => {
      const response = await fetch(`/api/posts/${postId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason, description })
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
      const response = await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment: comment || '' })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Post shared to your timeline!" });
      setShowShareOptions(false);
    }
  });
  
  const handleReaction = (reaction: string) => {
    setUserReaction(reaction);
    setShowReactions(false);
    reactionMutation.mutate({ postId: post.id, reaction });
  };

  const handleReport = (reason: string, description: string) => {
    reportMutation.mutate({ postId: post.id, reason, description });
  };

  const handleShareToWall = (comment?: string) => {
    shareToWallMutation.mutate({ postId: post.id, comment });
  };

  const handleComment = () => {
    if (comment.trim()) {
      commentMutation.mutate({ postId: post.id, content: comment });
    }
  };

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Parse location if it's JSON
  const getLocationName = (location: any) => {
    if (!location) return null;
    try {
      const loc = typeof location === 'string' ? JSON.parse(location) : location;
      return loc.name || loc.formatted_address || location;
    } catch {
      return location;
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-sm mb-4">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            {/* Avatar */}
            {post.user?.profileImage ? (
              <img
                src={post.user.profileImage}
                alt={post.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {getAvatarFallback(post.user?.name || 'U')}
              </div>
            )}
            
            {/* User info */}
            <div>
              <h3 className="font-medium text-[15px] text-gray-900 hover:underline cursor-pointer">
                {post.user?.name || 'Anonymous'}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{formatDistanceToNow(new Date(post.createdAt))}</span>
                {post.location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {getLocationName(post.location)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Menu button */}
          <div className="relative">
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>
            
            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    setIsReportModalOpen(true);
                    setShowMenu(false);
                  }}
                >
                  <Flag className="h-4 w-4" />
                  Report post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-[15px] text-gray-900 whitespace-pre-wrap">{post.content}</p>
        
        {/* Emotion tags - subtle display */}
        {post.emotionTags?.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            Feeling {post.emotionTags.join(', ')}
          </div>
        )}
      </div>

      {/* Media */}
      {(post.imageUrl || post.videoUrl) && (
        <div className="relative">
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              className="w-full object-cover"
            />
          )}
          {post.videoUrl && (
            <video
              src={post.videoUrl}
              controls
              className="w-full"
            />
          )}
        </div>
      )}

      {/* Engagement stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          {/* Show reactions with proper spacing */}
          {post.reactions && Object.keys(post.reactions).length > 0 && (
            <div className="flex items-center -space-x-1">
              {Object.entries(post.reactions)
                .filter(([_, count]) => count > 0)
                .slice(0, 3)
                .map(([reaction, count], index) => (
                  <div
                    key={reaction}
                    className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-200"
                    style={{ zIndex: 3 - index }}
                  >
                    <span className="text-sm">{reaction}</span>
                  </div>
                ))}
            </div>
          )}
          <span className="hover:underline cursor-pointer">{post.likes || 0}</span>
          {post.views && (
            <>
              <span>·</span>
              <span>{post.views} views</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hover:underline cursor-pointer">{comments.length || 0} comments</span>
          <span>{post.shares || 0} shares</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-1 border-t border-b border-gray-200">
        <div className="flex items-center justify-around">
          {/* Like/React button */}
          <button
            className="relative flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded transition-colors"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 300)}
            onClick={() => !userReaction && handleReaction('👍')}
          >
            {userReaction ? (
              <>
                <span className="text-lg">{userReaction}</span>
                <span className={`text-sm font-medium ${userReaction === '👍' ? 'text-blue-600' : 'text-gray-700'}`}>
                  {userReaction === '👍' ? 'Like' : 'React'}
                </span>
              </>
            ) : (
              <>
                <ThumbsUp className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Like</span>
              </>
            )}
            
            {/* Reaction picker */}
            {showReactions && (
              <div 
                className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1 flex items-center gap-1"
                onMouseEnter={() => setShowReactions(true)}
              >
                {reactions.map(reaction => (
                  <button
                    key={reaction}
                    className="p-1.5 hover:scale-125 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReaction(reaction);
                    }}
                  >
                    <span className="text-xl">{reaction}</span>
                  </button>
                ))}
              </div>
            )}
          </button>

          {/* Comment button */}
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded transition-colors"
            onClick={() => setShowCommentBox(!showCommentBox)}
          >
            <MessageCircle className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Comment</span>
          </button>

          {/* Share button */}
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded transition-colors"
            onClick={() => setShowShareOptions(true)}
          >
            <Share2 className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Share</span>
          </button>
        </div>
      </div>

      {/* Comment box */}
      {showCommentBox && (
        <div className="p-4 flex gap-2">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && comment.trim()) {
                  handleComment();
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Show existing comments */}
      {showCommentBox && comments.length > 0 && (
        <div className="px-4 pb-4 space-y-3">
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                {getAvatarFallback(comment.user?.name || 'U')}
              </div>
              <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                <p className="text-sm font-medium text-gray-900">{comment.user?.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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
                  navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
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

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        postId={parseInt(post.id, 10)}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReport}
      />
    </article>
  );
}