import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, MapPin, 
  Clock, Send, AlertCircle, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MemoryCardProps {
  post: any;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function CleanMemoryCard({ post, onLike, onComment, onShare }: MemoryCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // Reactions array - simple and clean
  const reactions = ['❤️', '🔥', '😍', '🎉', '👏'];
  const [selectedReaction, setSelectedReaction] = useState(post.currentUserReaction || '');

  // Get avatar fallback
  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Parse location
  const getLocationName = (location: any) => {
    if (typeof location === 'string') {
      try {
        const parsed = JSON.parse(location);
        return parsed.name || parsed.formatted_address || 'Unknown location';
      } catch {
        return location || 'Unknown location';
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

  React.useEffect(() => {
    if (commentsData?.data) {
      setComments(commentsData.data);
    }
  }, [commentsData]);

  // Like/Reaction mutation
  const reactionMutation = useMutation({
    mutationFn: async (reaction: string) => {
      const response = await fetch(`/api/posts/${post.id}/reactions`, {
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

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      setCommentText('');
      toast({ title: "Comment posted!" });
    }
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: async ({ reason, description }: { reason: string; description: string }) => {
      const response = await fetch(`/api/posts/${post.id}/reports`, {
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
        description: "Thank you for helping keep our community safe."
      });
      setShowReportDialog(false);
      setReportReason('');
      setReportDescription('');
    }
  });

  // Handlers
  const handleReaction = (reaction: string) => {
    const newReaction = reaction === selectedReaction ? '' : reaction;
    setSelectedReaction(newReaction);
    reactionMutation.mutate(newReaction);
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };

  const handleSubmitReport = () => {
    if (reportReason && reportDescription.trim()) {
      reportMutation.mutate({ reason: reportReason, description: reportDescription });
    }
  };

  const isOwner = post.userId === user?.id;

  return (
    <>
      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {post.user?.profileImage ? (
                  <img 
                    src={post.user.profileImage} 
                    alt={post.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getAvatarFallback(post.user?.name || 'Unknown')
                )}
              </div>
              
              {/* User info */}
              <div>
                <h3 className="font-semibold text-gray-900">{post.user?.name || 'Unknown User'}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  {post.location && (
                    <>
                      <span>•</span>
                      <MapPin className="w-3 h-3" />
                      <span>{getLocationName(post.location)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-500"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                  {isOwner ? (
                    <>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                        Edit Post
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">
                        Delete Post
                      </button>
                    </>
                  ) : (
                    <button 
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                      onClick={() => {
                        setShowMenu(false);
                        setShowReportDialog(true);
                      }}
                    >
                      Report Post
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
          
          {/* Emotion tags */}
          {post.emotionTags && post.emotionTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.emotionTags.map((tag: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Media */}
        {post.imageUrl && (
          <div className="px-4 pb-4">
            <img 
              src={post.imageUrl} 
              alt="Post content"
              className="w-full rounded-lg object-cover max-h-96"
            />
          </div>
        )}

        {/* Reactions Bar */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2">
            {reactions.map((reaction) => (
              <button
                key={reaction}
                onClick={() => handleReaction(reaction)}
                className={`px-3 py-1 rounded-full text-lg transition-all ${
                  selectedReaction === reaction 
                    ? 'bg-indigo-100 scale-110' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {reaction}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100">
          <div className="flex items-center justify-around py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Comment</span>
              {post.comments > 0 && <span className="text-sm">({post.comments})</span>}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-100 p-4 space-y-4">
            {/* Comment Input */}
            <div className="flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || commentMutation.isPending}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-semibold">
                    {getAvatarFallback(comment.user?.name || 'U')}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="font-semibold text-sm">{comment.user?.name || 'Unknown'}</p>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Reason for reporting</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason}>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inappropriate" id="inappropriate" />
                    <Label htmlFor="inappropriate">Inappropriate content</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="spam" id="spam" />
                    <Label htmlFor="spam">Spam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="harassment" id="harassment" />
                    <Label htmlFor="harassment">Harassment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="description">Additional details</Label>
              <Textarea
                id="description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please provide more details..."
                className="mt-2"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReport}
                disabled={!reportReason || !reportDescription.trim() || reportMutation.isPending}
              >
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}