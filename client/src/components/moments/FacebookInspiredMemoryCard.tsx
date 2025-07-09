import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageCircle, Share2, MoreVertical, MapPin, 
  Clock, CheckCircle, Users, BookmarkIcon, Music
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ReportModal } from '@/components/ui/ReportModal';
import { FacebookReactionSelector } from '@/components/ui/FacebookReactionSelector';
import { RichTextCommentEditor } from '@/components/ui/RichTextCommentEditor';
import { PostContextMenu } from '@/components/ui/PostContextMenu';
import { RoleEmojiDisplay } from '@/components/ui/RoleEmojiDisplay';
import { formatUserLocation } from '@/utils/locationUtils';

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
  
  const [currentUserReaction, setCurrentUserReaction] = useState<string>(post.currentUserReaction || '');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Helper functions
  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLocationName = (location: any) => {
    if (typeof location === 'string') {
      try {
        const parsed = JSON.parse(location);
        return parsed.name || parsed.formatted_address || location;
      } catch {
        return location;
      }
    }
    return location?.name || location?.formatted_address || 'Unknown location';
  };

  // Load comments
  const { data: commentsData } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      return response.json();
    },
    enabled: showComments
  });

  useEffect(() => {
    if (commentsData?.data) {
      setComments(commentsData.data);
    }
  }, [commentsData]);
  
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
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content, mentions }: { postId: string; content: string; mentions: string[] }) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, mentions })
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      
      // Add new comment to local state
      const newComment = {
        id: Date.now(),
        content: data.comment || data.content,
        userId: user?.id || 0,
        user: {
          id: user?.id || 0,
          name: user?.name || 'Anonymous',
          profileImage: user?.profileImage
        },
        createdAt: new Date().toISOString(),
        mentions: data.mentions || []
      };
      setComments(prev => [...prev, newComment]);
      
      setShowComments(true);
      toast({ title: "Comment posted successfully!" });
    }
  });

  const reportMutation = useMutation({
    mutationFn: async ({ postId, reason, description }: { postId: string; reason: string; description: string }) => {
      const response = await fetch(`/api/posts/${postId}/report`, {
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

  // Handler functions
  const handleReaction = (reactionId: string) => {
    setCurrentUserReaction(reactionId === currentUserReaction ? '' : reactionId);
    reactionMutation.mutate({ postId: post.id, reaction: reactionId });
  };

  const handleComment = (content: string, mentions: string[]) => {
    commentMutation.mutate({ postId: post.id, content, mentions });
  };

  const handleEdit = () => {
    toast({ 
      title: "Edit feature coming soon",
      description: "This feature is being implemented."
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
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
    setShowShareOptions(true);
  };

  const handleShareToWall = (comment?: string) => {
    shareToWallMutation.mutate({ postId: post.id, comment });
  };

  const isOwner = post.userId === user?.id;

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {post.user?.profileImage ? (
              <img
                src={post.user.profileImage}
                alt={post.user.name || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {getAvatarFallback(post.user?.name || 'Anonymous')}
              </div>
            )}
            
            {/* User info */}
            <div>
              <h3 className="font-semibold text-gray-900">
                {post.user?.name || 'Anonymous'}
              </h3>
              
              {/* Role emoji display */}
              <RoleEmojiDisplay
                tangoRoles={post.user?.tangoRoles}
                leaderLevel={post.user?.leaderLevel}
                followerLevel={post.user?.followerLevel}
                size="sm"
                maxRoles={5}
                className="mt-1"
              />
              
              {/* Timestamp and location */}
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <time>{formatDistanceToNow(new Date(post.createdAt))} ago</time>
                {post.location && (
                  <>
                    <span>·</span>
                    <MapPin className="h-4 w-4" />
                    <span>{getLocationName(post.location)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Menu */}
          <PostContextMenu
            postId={post.id}
            isOwner={isOwner}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReport={() => setIsReportModalOpen(true)}
            onShare={handleShare}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        
        {/* Media */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post content"
            className="mt-3 rounded-lg w-full"
          />
        )}
      </div>

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
        </div>
        <div className="flex items-center gap-3">
          <span className="hover:underline cursor-pointer">{comments.length || 0} comments</span>
          <span>{post.shares || 0} shares</span>
        </div>
      </div>

      <div className="border-t border-gray-200"></div>

      {/* Action buttons */}
      <div className="px-2 py-1 flex items-center">
        {/* Facebook-style Reaction System */}
        <FacebookReactionSelector
          postId={post.id}
          currentReaction={currentUserReaction}
          reactions={post.reactions}
          onReact={handleReaction}
        />

        {/* Comment button */}
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded transition-colors"
          onClick={() => setShowComments(!showComments)}
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

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200">
          {/* Comment Editor */}
          <div className="p-4">
            <RichTextCommentEditor
              postId={post.id}
              onSubmit={handleComment}
              placeholder="Write a thoughtful comment..."
            />
          </div>

          {/* Existing Comments */}
          {comments.length > 0 && (
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
        postId={post.id}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReport}
      />
    </article>
  );
}