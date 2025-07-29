import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '../lib/queryClient';
import DashboardLayout from '../layouts/DashboardLayout';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/auth-context';
import { formatDistanceToNow } from 'date-fns';
import {
  ImageIcon,
  MapPin,
  Star,
  Upload,
  X,
  Loader2,
  MessageCircle,
  Share2,
  Sparkles,
  Users,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';
import { debounce, useMemoryCleanup, measureComponentPerformance } from '../lib/performance-critical-fix';

// Import styles
import '../styles/enhanced-memories.css';

// Import only essential components directly
import { RoleEmojiDisplay } from '../components/ui/RoleEmojiDisplay';
import { PostContextMenu } from '../components/ui/PostContextMenu';
import { EnhancedPostCreator, EnhancedMemoryCard } from '../components/memories/EnhancedMemoriesUI';

// Lazy load heavy components
import { 
  LazyEventBoard,
  LazyBeautifulPostCreator,
  LazyFacebookReactionSelector,
  LazyRichTextCommentEditor,
  LazyReportModal,
  withSuspense
} from '../lib/lazy-components';

const EventsBoard = withSuspense(LazyEventBoard);
const BeautifulPostCreator = withSuspense(LazyBeautifulPostCreator);
const FacebookReactionSelector = withSuspense(LazyFacebookReactionSelector);
const RichTextCommentEditor = withSuspense(LazyRichTextCommentEditor);
const ReportModal = withSuspense(LazyReportModal);

interface Memory {
  id: string;
  content: string;
  userId: number;
  createdAt: string;
  userName?: string;
  userUsername?: string;
  userProfileImage?: string;
  emotionTags?: string[];
  location?: any;
  reactions?: Record<string, number>;
  currentUserReaction?: string;
  comments?: any[];
  imageUrl?: string;
  videoUrl?: string;
  hashtags?: string[];
  mentions?: any[];
  hasConsent?: boolean;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
    city?: string;
    state?: string;
    country?: string;
    tangoRoles?: string[];
    leaderLevel?: string;
    followerLevel?: string;
  };
}

interface MemoryCardProps {
  memory: Memory;
}

// Memoize MemoryCard to prevent unnecessary re-renders
const MemoryCard = React.memo(function MemoryCard({ memory }: MemoryCardProps) {
  const cleanup = measureComponentPerformance('MemoryCard');
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [comments, setComments] = useState(memory.comments || []);
  const [currentUserReaction, setCurrentUserReaction] = useState(memory.currentUserReaction);
  const { toast } = useToast();
  const { user } = useAuth();

  // Determine API base path for memories
  const apiBasePath = '/api/memories';

  // Fetch comments when expanded
  const { data: fetchedComments } = useQuery({
    queryKey: [`${apiBasePath}/${memory.id}/comments`],
    queryFn: async () => {
      const response = await fetch(`${apiBasePath}/${memory.id}/comments`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      const result = await response.json();
      return result.data || [];
    },
    enabled: showComments && memory.id != null
  });

  useEffect(() => {
    if (fetchedComments) {
      setComments(fetchedComments);
    }
  }, [fetchedComments]);

  // Mutations for social features
  const reactionMutation = useMutation({
    mutationFn: async ({ reaction }: { reaction: string }) => {
      const response = await fetch(`${apiBasePath}/${memory.id}/reactions`, {
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
    mutationFn: async ({ content, mentions }: { content: string; mentions: string[] }) => {
      const response = await fetch(`${apiBasePath}/${memory.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, mentions })
      });
      return response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      queryClient.invalidateQueries({ queryKey: [`${apiBasePath}/${memory.id}/comments`] });
      if (response.data) {
        setComments(prev => [...prev, response.data]);
      }
      setShowComments(true);
      toast({ title: "Comment posted successfully!" });
    }
  });

  const shareMutation = useMutation({
    mutationFn: async ({ comment }: { comment?: string }) => {
      const response = await fetch(`${apiBasePath}/${memory.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment: comment || '' })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Post shared to your timeline!" });
      setShowShareDialog(false);
    }
  });

  const reportMutation = useMutation({
    mutationFn: async ({ reason, description }: { reason: string; description: string }) => {
      const response = await fetch(`${apiBasePath}/${memory.id}/report`, {
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

  const handleReaction = (reactionId: string) => {
    setCurrentUserReaction(reactionId === currentUserReaction ? '' : reactionId);
    reactionMutation.mutate({ reaction: reactionId });
  };

  const handleComment = (content: string, mentions: string[]) => {
    commentMutation.mutate({ content, mentions });
  };

  const handleShare = (comment?: string) => {
    shareMutation.mutate({ comment });
  };

  const handleReport = (reason: string, description: string) => {
    reportMutation.mutate({ reason, description });
  };

  const formatUserLocation = (user: any) => {
    if (!user) return '';
    const parts = [];
    if (user.city) parts.push(user.city);
    if (user.state) parts.push(user.state);
    if (user.country) parts.push(user.country);
    return parts.join(', ');
  };

  const parseLocation = (locationString: string) => {
    try {
      if (!locationString) return null;
      const parsed = JSON.parse(locationString);
      return parsed.name || parsed.formatted_address || '';
    } catch {
      return locationString;
    }
  };

  const isOwner = memory.userId === user?.id;

  return (
    <div className="relative group">
      {/* Ocean wave pattern background on hover */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-turquoise-400/10 via-cyan-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='100' viewBox='0 0 200 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50c20-10 40-10 60 0s40 10 60 0s40-10 60 0s40 10 60 0' stroke='%2338b2ac' stroke-width='3' fill='none' /%3E%3C/svg%3E")`,
               backgroundRepeat: 'repeat-x',
               backgroundPosition: 'bottom',
               animation: 'float 4s ease-in-out infinite'
             }} />
      </div>
      
      <Card className="relative p-6 space-y-4 hover:shadow-2xl transition-all duration-500 rounded-3xl border-2 border-turquoise-200/70 hover:border-cyan-300 card-lift smooth-appear beautiful-hover bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-turquoise-200/50 overflow-hidden">
        {/* Ocean accent decoration */}
        <div className="absolute -top-2 -right-2 w-24 h-24 bg-gradient-to-br from-turquoise-200 to-cyan-200 rounded-full blur-2xl opacity-30" />
        <div className="absolute -bottom-2 -left-2 w-32 h-32 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full blur-2xl opacity-25" />
        
        {/* Enhanced Header with consistent layout */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-turquoise-400 ring-offset-2 ring-offset-white group-hover:ring-cyan-500 transition-all duration-300">
                <AvatarImage src={memory.userProfileImage || memory.user?.profileImage} />
                <AvatarFallback className="bg-gradient-to-br from-turquoise-400 to-blue-500 text-white font-bold">
                  {(memory.userName || memory.user?.name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </div>
          
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-turquoise-700 transition-colors">
                  {memory.userName || memory.user?.name || 'Anonymous'}
                </h3>
                <span className="text-sm text-gray-500">@{memory.userUsername || memory.user?.username || 'user'}</span>
              </div>
              
              {/* Location and roles in same line for consistency */}
              <div className="flex items-center gap-3 mt-1">
                {memory.user && formatUserLocation(memory.user) && (
                  <div className="flex items-center gap-1 text-sm text-turquoise-600">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{formatUserLocation(memory.user)}</span>
                  </div>
                )}
                
                <RoleEmojiDisplay
                  tangoRoles={memory.user?.tangoRoles}
                  leaderLevel={memory.user?.leaderLevel ? Number(memory.user.leaderLevel) : undefined}
                  followerLevel={memory.user?.followerLevel ? Number(memory.user.followerLevel) : undefined}
                  size="sm"
                  maxRoles={3}
                  className="inline-flex"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gradient-to-r from-turquoise-50 to-cyan-50 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5 text-turquoise-600" />
            <time className="font-medium">{formatDistanceToNow(new Date(memory.createdAt))} ago</time>
          </div>
        </div>

      {/* Enhanced Emotion tags with ocean theme */}
      {(memory.emotionTags?.length || memory.hashtags?.length) && (
        <div className="flex items-center gap-4 text-sm p-3 bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 rounded-2xl">
          {memory.emotionTags && memory.emotionTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-turquoise-600 animate-sparkle" />
              <div className="flex gap-2 flex-wrap">
                {memory.emotionTags.map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-turquoise-100 to-cyan-100 text-turquoise-700 rounded-full text-xs font-medium hover:from-turquoise-200 hover:to-cyan-200 transition-all cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {memory.hashtags && memory.hashtags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {memory.hashtags.map((tag, i) => (
                <span key={i} className="text-cyan-600 hover:text-turquoise-700 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Content with better typography */}
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {memory.content}
        </p>
      </div>

      {/* Enhanced Media with ocean-themed border */}
      {memory.imageUrl && (
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <img 
            src={memory.imageUrl} 
            alt="Memory" 
            className="w-full object-cover max-h-[500px] hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Enhanced Actions bar with ocean theme */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-gradient-to-r from-turquoise-100 via-cyan-100 to-blue-100">
        <div className="flex items-center gap-2">
          <FacebookReactionSelector
            postId={memory.id}
            currentReaction={currentUserReaction}
            reactions={memory.reactions}
            onReact={handleReaction}
          />

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 mt-button ripple-container
                       ${showComments 
                         ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white shadow-lg' 
                         : 'text-gray-700 hover:bg-gradient-to-r hover:from-turquoise-100 hover:to-cyan-100'}`}
          >
            <MessageCircle className={`h-5 w-5 ${showComments ? 'fill-white' : ''} icon-glow`} />
            <span className="font-medium">{comments.length || 0}</span>
          </button>

          <button
            onClick={() => setShowShareDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-cyan-100 hover:to-blue-100 transition-all duration-300 mt-button ripple-container float-on-hover"
          >
            <Share2 className="h-5 w-5 icon-glow" />
            <span className="font-medium">Share</span>
          </button>
        </div>

        <PostContextMenu
          postId={Number(memory.id)}
          isOwner={isOwner}
          onEdit={() => {
            // TODO: Implement edit functionality
            console.log('Edit post:', memory.id);
          }}
          onDelete={async () => {
            if (confirm('Are you sure you want to delete this memory?')) {
              try {
                const response = await fetch(`${apiBasePath}/${memory.id}`, {
                  method: 'DELETE',
                  credentials: 'include'
                });
                if (response.ok) {
                  toast({ title: "Memory deleted successfully" });
                  queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
                } else {
                  toast({ title: "Failed to delete memory", variant: "destructive" });
                }
              } catch (error) {
                toast({ title: "Error deleting memory", variant: "destructive" });
              }
            }
          }}
          onReport={() => setIsReportModalOpen(true)}
          onShare={() => setShowShareDialog(true)}
        />
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 pt-4 border-t">
          <RichTextCommentEditor
            postId={Number(memory.id)}
            onSubmit={handleComment}
            placeholder="Write a comment..."
          />
          
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {comment.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="font-medium text-sm">{comment.user?.name || 'Unknown User'}</p>
                      <div className="text-sm" dangerouslySetInnerHTML={{ __html: comment.content }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareDialog(false)}>
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw]" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Share Memory</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleShare()}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <p className="font-medium">Share to Timeline</p>
                <p className="text-sm text-gray-600">Share this memory on your timeline</p>
              </button>
              
              <button
                onClick={() => {
                  const comment = prompt("Add a comment to your share:");
                  if (comment !== null) handleShare(comment);
                }}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <p className="font-medium">Share with Comment</p>
                <p className="text-sm text-gray-600">Add your thoughts when sharing</p>
              </button>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/memories/${memory.id}`);
                  toast({ title: "Link copied!" });
                  setShowShareDialog(false);
                }}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <p className="font-medium">Copy Link</p>
                <p className="text-sm text-gray-600">Copy memory link to clipboard</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        postId={Number(memory.id)}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReport}
      />
      </Card>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance - only re-render if key properties change
  return prevProps.memory.id === nextProps.memory.id &&
         prevProps.memory.reactions === nextProps.memory.reactions &&
         prevProps.memory.comments?.length === nextProps.memory.comments?.length;
});

// Life CEO 44x21s: Memory Card with Backend Interactions
const MemoryCardWithInteractions: React.FC<{
  memory: Memory;
  user: any;
}> = ({ memory, user }) => {
  const { toast } = useToast();
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  
  // Reaction mutation
  const reactionMutation = useMutation({
    mutationFn: async ({ emoji }: { emoji: string }) => {
      return apiRequest('/api/posts/' + memory.id + '/reactions', {
        method: 'POST',
        body: JSON.stringify({ reaction: emoji })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      toast({
        title: "Reaction added! 💃",
        description: "Your reaction has been added to the memory",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add reaction",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      return apiRequest('/api/posts/' + memory.id + '/comments', {
        method: 'POST',
        body: JSON.stringify({ content })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      toast({
        title: "Comment posted! 💬",
        description: "Your comment has been added",
      });
      setCommentText('');
      setShowCommentBox(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post comment",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async ({ comment }: { comment?: string }) => {
      return apiRequest('/api/posts/' + memory.id + '/share', {
        method: 'POST',
        body: JSON.stringify({ comment })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      toast({
        title: "Memory shared! 🎉",
        description: "Memory has been shared to your timeline",
      });
      setShowShareDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to share",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  // Save mutation (using bookmark/save endpoint)
  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/posts/' + memory.id + '/save', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Memory saved! 📌",
        description: "Memory has been saved to your collection",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  // Report mutation - Life CEO 44x21s methodology
  const reportMutation = useMutation({
    mutationFn: async ({ reason, description }: { reason: string; description?: string }) => {
      return apiRequest('/api/posts/' + memory.id + '/report', {
        method: 'POST',
        body: JSON.stringify({ 
          reportType: reason,
          description: description || '',
          memoryId: memory.id
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Report submitted 🔍",
        description: "Thank you for helping keep our community safe. An admin will review this shortly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit report",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  const handleInteraction = (type: string, data?: any) => {
    console.log('Memory interaction:', type, data);
    
    switch (type) {
      case 'reaction':
        if (data?.emoji) {
          reactionMutation.mutate({ emoji: data.emoji });
        }
        break;
      case 'comment':
        setShowCommentBox(true);
        break;
      case 'share':
        setShowShareDialog(true);
        break;
      case 'save':
        saveMutation.mutate();
        break;
      case 'report':
        // Show report dialog
        setShowReportDialog(true);
        break;
      case 'edit':
        // Handle edit if user owns the post
        if (memory.userId === user?.id) {
          toast({ title: "Edit feature coming soon!" });
        }
        break;
      case 'delete':
        // Handle delete if user owns the post
        if (memory.userId === user?.id) {
          toast({ title: "Delete feature coming soon!" });
        }
        break;
    }
  };

  return (
    <>
      <EnhancedMemoryCard 
        memory={memory}
        onInteraction={handleInteraction}
      />
      
      {/* Comment Box */}
      {showCommentBox && (
        <div className="mt-2 p-4 glassmorphic-card rounded-xl animate-fadeIn">
          <div className="flex gap-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 min-h-[60px] glassmorphic-input"
              disabled={commentMutation.isPending}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  if (commentText.trim()) {
                    commentMutation.mutate({ content: commentText });
                  }
                }}
                disabled={!commentText.trim() || commentMutation.isPending}
                className="bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white hover:from-turquoise-600 hover:to-cyan-700"
              >
                {commentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
              </Button>
              <Button
                onClick={() => {
                  setShowCommentBox(false);
                  setCommentText('');
                }}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Dialog */}
      {showReportDialog && (
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="glassmorphic-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-turquoise-600 to-cyan-700">
                Report Memory
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Reason for reporting</label>
                <select 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full mt-1 p-2 glassmorphic-input rounded-lg"
                >
                  <option value="">Select a reason</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="spam">Spam</option>
                  <option value="harassment">Harassment</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="copyright">Copyright Violation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Additional details (optional)</label>
                <Textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Please provide more context..."
                  className="w-full mt-1 glassmorphic-input"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => {
                    setShowReportDialog(false);
                    setReportReason('');
                    setReportDescription('');
                  }}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (reportReason) {
                      reportMutation.mutate({ 
                        reason: reportReason, 
                        description: reportDescription 
                      });
                      setShowReportDialog(false);
                      setReportReason('');
                      setReportDescription('');
                    }
                  }}
                  disabled={!reportReason || reportMutation.isPending}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                >
                  {reportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Report'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="glassmorphic-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-turquoise-600 to-cyan-700">
                Share Memory
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <Button
                onClick={() => shareMutation.mutate({})}
                disabled={shareMutation.isPending}
                className="w-full justify-start hover:bg-turquoise-50 transition-colors"
                variant="ghost"
              >
                <Share2 className="w-4 h-4 mr-2 text-turquoise-600" />
                <div className="text-left">
                  <p className="font-medium">Share to Timeline</p>
                  <p className="text-sm text-gray-600">Share this memory on your timeline</p>
                </div>
              </Button>
              
              <Button
                onClick={() => {
                  const comment = prompt("Add a comment to your share:");
                  if (comment !== null) {
                    shareMutation.mutate({ comment });
                  }
                }}
                disabled={shareMutation.isPending}
                className="w-full justify-start hover:bg-turquoise-50 transition-colors"
                variant="ghost"
              >
                <MessageCircle className="w-4 h-4 mr-2 text-turquoise-600" />
                <div className="text-left">
                  <p className="font-medium">Share with Comment</p>
                  <p className="text-sm text-gray-600">Add your thoughts when sharing</p>
                </div>
              </Button>
              
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/memories/${memory.id}`);
                  toast({ title: "Link copied! 📋" });
                  setShowShareDialog(false);
                }}
                className="w-full justify-start hover:bg-turquoise-50 transition-colors"
                variant="ghost"
              >
                <X className="w-4 h-4 mr-2 text-turquoise-600" />
                <div className="text-left">
                  <p className="font-medium">Copy Link</p>
                  <p className="text-sm text-gray-600">Copy memory link to clipboard</p>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default function EnhancedTimelineV2() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Performance monitoring
  const cleanup = measureComponentPerformance('EnhancedTimelineV2');
  useMemoryCleanup([]);
  
  console.log('EnhancedTimelineV2 component loaded!', { user });

  // Create memory mutation - using Life CEO 44x21s methodology
  const createMemoryMutation = useMutation({
    mutationFn: async (data: any) => {
      // Use the enhanced posts endpoint that exists
      const response = await apiRequest('/api/posts/enhanced', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      toast({
        title: "Memory created! ✨",
        description: "Your tango moment has been shared with the community",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create memory",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Fetch timeline posts with caching
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/posts/feed'],
    queryFn: async () => {
      const response = await fetch('/api/posts/feed', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false // Don't refetch on window focus
  });
  
  // Memoize posts to prevent unnecessary re-renders
  const memoizedPosts = useMemo(() => posts, [posts]);
  
  // Cleanup performance monitoring on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50/50 via-cyan-50 to-blue-50/50 relative overflow-hidden">
        {/* Ocean wave pattern background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 ocean-wave-pattern" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-8">
              {/* Beautiful Ocean-Themed Header - Mobile Optimized */}
              <div className="mb-6 lg:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 rounded-2xl lg:rounded-3xl blur-2xl opacity-30" />
                <div className="relative p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50 shadow-xl border-2 border-turquoise-200/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 lg:gap-4 mb-2">
                    <div className="p-2.5 lg:p-3 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-xl animate-float shadow-lg">
                      <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      Memories
                    </h1>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 ml-0 sm:ml-[50px] lg:ml-[60px] font-medium">Share your precious moments with the Tango community</p>
                </div>
              </div>

            {/* Enhanced Memory Post Creator */}
            <div className="mb-6">
              <EnhancedPostCreator 
                user={user ? {
                  id: user.id,
                  name: user.name,
                  username: user.username,
                  profileImage: user.profileImage || undefined
                } : undefined}
                onPost={(data) => {
                  createMemoryMutation.mutate({
                    content: data.content,
                    emotionTags: data.emotions,
                    location: data.location,
                    hashtags: data.tags,
                    mentions: data.mentions,
                    mediaUrls: data.media.map((f: File) => URL.createObjectURL(f)),
                    visibility: data.visibility
                  });
                }}
              />
            </div>

            {/* Posts with Virtual Scrolling */}
            <div className="space-y-6">
              {isLoading ? (
                <>
                  {/* Loading Skeleton Cards */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-turquoise-400/10 via-blue-400/10 to-cyan-400/10 rounded-3xl blur-xl opacity-50 animate-pulse" />
                      
                      <Card className="relative glassmorphic-card p-6 space-y-4 rounded-3xl border-white/50">
                        {/* Header Skeleton */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-32 animate-pulse" />
                              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-24 animate-pulse" />
                              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-40 animate-pulse" />
                            </div>
                          </div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="space-y-3">
                          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full animate-pulse" />
                          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-5/6 animate-pulse" />
                          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/6 animate-pulse" />
                        </div>

                        {/* Image Skeleton */}
                        <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse" />

                        {/* Actions Skeleton */}
                        <div className="flex items-center justify-between pt-4">
                          <div className="flex gap-4">
                            {[1, 2, 3].map((j) => (
                              <div key={j} className="h-10 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
                            ))}
                          </div>
                          <div className="h-8 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
                        </div>
                      </Card>
                    </div>
                  ))}
                </>
              ) : posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post: Memory) => (
                    <MemoryCardWithInteractions 
                      key={post.id} 
                      memory={post}
                      user={user}
                    />
                  ))}
                </div>
              ) : (
                <div className="glassmorphic-card p-12 rounded-3xl text-center">
                  <div className="max-w-md mx-auto">
                    <div className="p-4 bg-gradient-to-r from-turquoise-400 to-blue-500 rounded-2xl inline-block mb-4">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No memories yet</h3>
                    <p className="text-gray-600">Start sharing your precious Tango moments with the community. Your first memory is just a click away!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <EventsBoard />
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}