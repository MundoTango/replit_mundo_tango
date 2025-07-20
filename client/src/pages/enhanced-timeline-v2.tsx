import React, { useState, useEffect } from 'react';
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

// Import all the social feature components
import { FacebookReactionSelector } from '../components/ui/FacebookReactionSelector';
import { RichTextCommentEditor } from '../components/ui/RichTextCommentEditor';
import { RoleEmojiDisplay } from '../components/ui/RoleEmojiDisplay';
import { PostContextMenu } from '../components/ui/PostContextMenu';
import { ReportModal } from '../components/ui/ReportModal';
import EventsBoard from '../components/events/EventsBoard';
import BeautifulPostCreator from '../components/universal/BeautifulPostCreator';

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

function MemoryCard({ memory }: MemoryCardProps) {
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
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-turquoise-400/10 via-blue-400/10 to-cyan-400/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <Card className="relative glassmorphic-card p-6 space-y-4 hover:shadow-xl transition-all duration-300 rounded-3xl border-white/50 hover:border-turquoise-300/50 card-lift smooth-appear">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-white/50 group-hover:ring-turquoise-300/50 transition-all">
              <AvatarImage src={memory.userProfileImage || memory.user?.profileImage} />
              <AvatarFallback className="bg-gradient-to-br from-turquoise-400 to-blue-500 text-white">
                {(memory.userName || memory.user?.name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          
            <div className="flex-1">
              <h3 className="font-bold text-lg">{memory.userName || memory.user?.name || 'Anonymous'}</h3>
              {memory.user && (
                <p className="text-sm text-gray-600">{formatUserLocation(memory.user)}</p>
              )}
              <RoleEmojiDisplay
                tangoRoles={memory.user?.tangoRoles}
                leaderLevel={memory.user?.leaderLevel}
                followerLevel={memory.user?.followerLevel}
                size="sm"
                maxRoles={5}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <time>{formatDistanceToNow(new Date(memory.createdAt))} ago</time>
          </div>
        </div>

      {/* Emotion tags and location */}
      {(memory.emotionTags?.length || memory.location) && (
        <div className="flex items-center gap-4 text-sm">
          {memory.emotionTags && memory.emotionTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <div className="flex gap-2 flex-wrap">
                {memory.emotionTags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {memory.location && (
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{parseLocation(memory.location)}</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-800">{memory.content}</p>
      </div>

      {/* Media */}
      {memory.imageUrl && (
        <img 
          src={memory.imageUrl} 
          alt="Memory" 
          className="w-full rounded-lg object-cover max-h-96"
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4">
          <FacebookReactionSelector
            postId={memory.id}
            currentReaction={currentUserReaction}
            reactions={memory.reactions}
            onReact={handleReaction}
          />

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all mt-button ripple-container"
          >
            <MessageCircle className="h-5 w-5 icon-glow" />
            <span>{comments.length || 0}</span>
          </button>

          <button
            onClick={() => setShowShareDialog(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all mt-button ripple-container float-on-hover"
          >
            <Share2 className="h-5 w-5 icon-glow" />
          </button>
        </div>

        <PostContextMenu
          postId={memory.id}
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
            postId={memory.id}
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
        postId={memory.id}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReport}
      />
      </Card>
    </div>
  );
}

export default function EnhancedTimelineV2() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  console.log('EnhancedTimelineV2 component loaded!', { user });

  // Fetch timeline posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/posts/feed'],
    queryFn: async () => {
      const response = await fetch('/api/posts/feed', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const result = await response.json();
      return result.data || [];
    }
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-8">
              {/* Beautiful Header */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-turquoise-400 to-blue-500 rounded-3xl blur-3xl opacity-20" />
                <div className="relative glassmorphic-card p-8 rounded-3xl">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-gradient-to-r from-turquoise-400 to-blue-500 rounded-xl animate-float">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Memories
                    </h1>
                  </div>
                  <p className="text-gray-600 ml-[60px]">Share your precious moments with the Tango community</p>
                </div>
              </div>

            {/* Beautiful Post Creator */}
            <div className="mb-6">
              <BeautifulPostCreator 
                context={{ type: 'memory' }}
                user={user}
                onPostCreated={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
                }}
              />
            </div>

            {/* Posts */}
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
                posts.map((post: Memory) => (
                  <MemoryCard key={post.id} memory={post} />
                ))
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