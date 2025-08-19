import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, MapPin, 
  Clock, Send, AlertCircle, X, Edit, Trash2, Flag
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
  
  // Component mounted/updated effect
  
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');

  // Reactions array - Fixed spacing
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

  // Load comments - CRITICAL FIX: Use correct API endpoint based on post type
  const commentsQuery = useQuery({
    queryKey: [`/api/memories/${post.id}/comments`],
    queryFn: async () => {
      // Always use memories endpoint for memory posts 
      const endpoint = `/api/memories/${post.id}/comments`;
      console.log(`🔍 Fetching comments from: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      console.log(`📝 Comments response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }
      const result = await response.json();
      console.log(`📝 Comments data:`, result);
      return result;
    },
    enabled: showComments,
    refetchOnWindowFocus: false
  });

  React.useEffect(() => {
    if (commentsQuery.data?.data) {
      setComments(commentsQuery.data.data);
    } else if (commentsQuery.data?.success === true && Array.isArray(commentsQuery.data.data)) {
      setComments(commentsQuery.data.data);
    }
  }, [commentsQuery.data]);

  // Like/Reaction mutation
  const reactionMutation = useMutation({
    mutationFn: async (reaction: string) => {
      const response = await fetch(`/api/memories/${post.id}/reactions`, {
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

  // Comment mutation - CRITICAL FIX: Use correct API endpoint for memory comments
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      // Always use memories endpoint for memory posts
      const endpoint = `/api/memories/${post.id}/comments`;
      console.log(`🔍 Posting comment to: ${endpoint}`);
      console.log(`📝 Comment content:`, content);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });
      
      console.log(`📝 Comment post response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Comment post failed:`, errorText);
        throw new Error(`Failed to post comment: ${response.statusText}`);
      }
      const result = await response.json();
      console.log(`✅ Comment posted successfully:`, result);
      return result;
    },
    onSuccess: async (data) => {
      setCommentText('');
      // Immediately add the new comment to local state
      if (data?.success && data?.data) {
        setComments(prev => [...prev, data.data]);
      }
      // Also refetch the comments to ensure sync
      await commentsQuery.refetch();
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [`/api/memories/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      toast({ title: "Comment posted!" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Edit mutation - Fixed to use correct endpoint
  const editMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/memories/${post.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });
      if (!response.ok) {
        throw new Error(`Failed to edit memory: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      setShowEditDialog(false);
      setEditContent('');
      toast({ 
        title: "Success",
        description: "Memory updated successfully!" 
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update memory. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/memories/${post.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      toast({ title: "Post deleted!" });
    }
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: async ({ reason, description }: { reason: string; description: string }) => {
      const response = await fetch(`/api/memories/${post.id}/reports`, {
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

  const handleEditPost = () => {
    if (editContent.trim()) {
      editMutation.mutate(editContent);
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
                  {post.user?.city && (
                    <>
                      <MapPin className="w-3 h-3" />
                      <span>{post.user.city}, {post.user.country}</span>
                      <span>•</span>
                    </>
                  )}
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                </div>
                {/* User roles/badges */}
                {post.user?.tangoRoles && post.user.tangoRoles.length > 0 && (
                  <div className="flex gap-2 mt-1">
                    {post.user.tangoRoles.slice(0, 5).map((role: string, idx: number) => (
                      <span key={idx} className="text-lg">
                        {role === 'leader' && '🕺'}
                        {role === 'follower' && '💃'}
                        {role === 'instructor' && '🎓'}
                        {role === 'dj' && '🎵'}
                        {role === 'organizer' && '🎭'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Menu Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setShowEditDialog(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                        Edit Post
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
                            deleteMutation.mutate();
                          }
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete Memory'}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowReportDialog(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4 text-red-500" />
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="mt-3">
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            
            {/* Location */}
            {post.location && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{getLocationName(post.location)}</span>
              </div>
            )}

            {/* ESA LIFE CEO 61x21 - Enhanced Media Display with Video Support */}
            {(() => {
              // Processing media for post
              
              // ESA LIFE CEO 61x21 - AGGRESSIVE media collection
              const allMediaUrls = [];
              
              // Check ALL possible fields where media might be stored
              // Priority 1: mediaEmbeds (array of URLs)
              if (post.mediaEmbeds) {
                // Processing mediaEmbeds
                if (Array.isArray(post.mediaEmbeds) && post.mediaEmbeds.length > 0) {
                  allMediaUrls.push(...post.mediaEmbeds);
                } else if (typeof post.mediaEmbeds === 'string' && post.mediaEmbeds.length > 0) {
                  // Sometimes it might be a single string
                  allMediaUrls.push(post.mediaEmbeds);
                }
              }
              
              // Priority 2: mediaUrls (array of URLs)
              if (post.mediaUrls) {
                // Processing mediaUrls
                if (Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0) {
                  allMediaUrls.push(...post.mediaUrls);
                } else if (typeof post.mediaUrls === 'string' && post.mediaUrls.length > 0) {
                  allMediaUrls.push(post.mediaUrls);
                }
              }
              
              // Priority 3: imageUrl (might be a video despite the name)
              if (post.imageUrl && typeof post.imageUrl === 'string' && post.imageUrl.length > 0) {
                // Processing imageUrl
                if (!allMediaUrls.includes(post.imageUrl)) {
                  allMediaUrls.push(post.imageUrl);
                }
              }
              
              // Priority 4: videoUrl
              if (post.videoUrl && typeof post.videoUrl === 'string' && post.videoUrl.length > 0) {
                // Processing videoUrl
                if (!allMediaUrls.includes(post.videoUrl)) {
                  allMediaUrls.push(post.videoUrl);
                }
              }
              
              // Priority 5: Check if there's a media field (some posts might use this)
              if (post.media) {
                // Processing media field
                if (Array.isArray(post.media)) {
                  allMediaUrls.push(...post.media.filter((m: any) => m && m.url).map((m: any) => m.url));
                }
              }
              
              // Remove duplicates and empty values
              const mediaToDisplay = [...new Set(allMediaUrls.filter(url => url && url.length > 0))];
              
              // Media array ready for display
              
              if (mediaToDisplay.length === 0) {
                // No media to display
                return null;
              }
              
              // Rendering media items
              
              return (
                <div className={`mt-3 grid gap-2 ${
                  mediaToDisplay.length === 1 ? 'grid-cols-1' : 
                  mediaToDisplay.length === 2 ? 'grid-cols-2' : 
                  'grid-cols-2'
                }`}>
                  {mediaToDisplay.map((url, index) => {
                    // ESA LIFE CEO 61x21 - Enhanced video detection
                    const lowerUrl = url.toLowerCase();
                    const isVideo = lowerUrl.includes('.mp4') || 
                      lowerUrl.includes('.mov') || 
                      lowerUrl.includes('.webm') ||
                      lowerUrl.includes('.avi') ||
                      lowerUrl.includes('.m4v') ||
                      lowerUrl.includes('.mkv') ||
                      lowerUrl.includes('.flv') ||
                      lowerUrl.includes('.wmv');
                    
                    // Ensure absolute URL
                    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
                    
                    // Create SUPER stable key
                    const mediaKey = `media-${post.id}-${index}`;
                    
                    // Processing media item
                    
                    if (isVideo) {
                      // Rendering video
                      return (
                        <div key={mediaKey} className="relative rounded-lg overflow-hidden bg-black" style={{ minHeight: '200px' }}>
                          <video
                            key={`video-${mediaKey}`}
                            src={fullUrl}
                            controls
                            className="w-full h-auto max-h-96 object-contain rounded-lg"
                            preload="metadata"
                            playsInline
                            muted={false}
                            autoPlay={false}
                            onLoadedMetadata={(e) => {
                              // Video metadata loaded
                              const video = e.currentTarget;
                              video.style.display = 'block';
                              video.style.visibility = 'visible';
                              video.style.opacity = '1';
                              video.style.minHeight = '200px';
                            }}
                            onCanPlay={(e) => {
                              // Video can play
                              const video = e.currentTarget;
                              video.style.display = 'block';
                              video.style.visibility = 'visible';
                            }}
                            onError={(e) => {
                              // Video loading error
                            }}
                            style={{ 
                              display: 'block', 
                              visibility: 'visible',
                              opacity: 1,
                              width: '100%',
                              minHeight: '200px'
                            }}
                          />
                        </div>
                      );
                    } else {
                      // Rendering image
                      return (
                        <div key={mediaKey} className="relative rounded-lg overflow-hidden">
                          <img
                            key={`img-${mediaKey}`}
                            src={fullUrl}
                            alt={`Media ${index + 1}`}
                            className="w-full h-auto max-h-96 object-cover rounded-lg"
                            loading="lazy"
                            onLoad={() => {
                              // Image loaded successfully
                            }}
                            onError={(e) => {
                              // Image loading error
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      );
                    }
                  })}
                </div>
              );
            })()}
          </div>

          {/* Reactions Bar - FIXED SPACING */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              {/* Reaction Buttons - FIXED: Smaller, properly spaced */}
              <div className="flex items-center gap-1">
                {reactions.map((reaction) => (
                  <button
                    key={reaction}
                    onClick={() => handleReaction(reaction)}
                    className={`
                      flex items-center justify-center w-6 h-6 rounded-full text-xs transition-all duration-200 border
                      ${selectedReaction === reaction 
                        ? 'bg-blue-100 ring-1 ring-blue-300 border-blue-300' 
                        : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <span className="select-none leading-none">{reaction}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">
                    {comments.length > 0 ? `${comments.length}` : 'Comment'}
                  </span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShare}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-100 px-4 py-3">
            {/* Comment List - FIXED: Better state handling */}
            {commentsQuery.isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
              </div>
            )}
            
            {!commentsQuery.isLoading && comments.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            )}
            
            {!commentsQuery.isLoading && comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-medium">
                      {getAvatarFallback(comment.user?.name || 'U')}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="font-medium text-sm">{comment.user?.name || 'Anonymous'}</p>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt)) : 'Just now'} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Comment Form */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getAvatarFallback(user?.name || 'You')
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 min-h-[40px] resize-none"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || commentMutation.isPending}
                  size="sm"
                  className="self-end"
                >
                  {commentMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditPost}
                disabled={!editContent.trim() || editMutation.isPending}
              >
                Update Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="spam" />
                  <Label htmlFor="spam">Spam</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="harassment" id="harassment" />
                  <Label htmlFor="harassment">Harassment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" />
                  <Label htmlFor="inappropriate">Inappropriate content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
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
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReport}
                disabled={!reportReason || !reportDescription.trim() || reportMutation.isPending}
                variant="destructive"
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