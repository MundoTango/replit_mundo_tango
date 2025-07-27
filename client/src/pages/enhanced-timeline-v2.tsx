import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
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

// Import only essential components directly
import { RoleEmojiDisplay } from '../components/ui/RoleEmojiDisplay';
import { PostContextMenu } from '../components/ui/PostContextMenu';

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
          onEdit={() => toast({ title: "Edit feature coming soon" })}
          onDelete={() => toast({ title: "Delete feature coming soon" })}
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

export default function EnhancedTimelineV2() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Performance monitoring
  const cleanup = measureComponentPerformance('EnhancedTimelineV2');
  useMemoryCleanup([]);
  
  console.log('EnhancedTimelineV2 component loaded!', { user });

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
              {/* Beautiful Ocean-Themed Header */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 rounded-3xl blur-2xl opacity-30" />
                <div className="relative p-8 rounded-3xl bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50 shadow-xl border-2 border-turquoise-200/50 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-xl animate-float shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      Memories
                    </h1>
                  </div>
                  <p className="text-gray-700 ml-[60px] font-medium">Share your precious moments with the Tango community</p>
                </div>
              </div>

            {/* Beautiful Post Creator */}
            <div className="mb-6">
              <BeautifulPostCreator 
                context={{ type: 'memory' }}
                user={user ? {
                  id: user.id,
                  name: user.name,
                  username: user.username,
                  profileImage: user.profileImage || undefined
                } : undefined}
                onPostCreated={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
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
                    <MemoryCard key={post.id} memory={post} />
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